const CONFIG = {
  inputDir: ".",
  outputFile: "./all_files.txt",

  extensions: [".ts", ".tsx", ".js", ".json"],

  // Only files whose content contains AT LEAST ONE of these keywords
  // will be exported. Matching is case-insensitive.
  // Leave the array EMPTY to export ALL matching files (no filter).
  keywords: [
    "@prisma/client",
    "prisma",
    "PrismaClient",
    "Mock Prisma",
    "MockPrisma",
    "transpilePackages",
    "serverExternalPackages",
    "turbopack",
    "Turbopack",
  ] as string[],

  excludeDirs: [
    "node_modules",
    ".next",
    ".git",
    ".vercel",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".cache",
    "source_export",
    "next-env.d.ts",
    "export-files.ts",
    "tsconfig.json",
    "bun.lock",
    ".env",
    ".agent"
  ],

  includeHidden: true,
  continueOnError: true,
};

// ============================================================
// IMPLEMENTATION — BUN GLOBAL APIs ONLY
// ============================================================

const normalize = (value: string): string =>
  value.replaceAll("\\", "/").replace(/\/+$/, "");

function join(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}

function relative(from: string, to: string): string {
  const a = normalize(from).split("/").filter(Boolean);
  const b = normalize(to).split("/").filter(Boolean);

  while (a.length && b.length && a[0] === b[0]) {
    a.shift();
    b.shift();
  }

  return [...a.map(() => ".."), ...b].join("/");
}

const root = normalize(CONFIG.inputDir);
const outputPath = normalize(CONFIG.outputFile);

const extensions = new Set(
  CONFIG.extensions.map((ext) => ext.toLowerCase()),
);
const excluded = new Set(CONFIG.excludeDirs);

// Prepare keyword filter (case-insensitive, ignore blank entries)
const keywords = CONFIG.keywords.filter((k) => k.trim().length > 0);
const lowerKeywords = keywords.map((k) => k.toLowerCase());
const useKeywordFilter = lowerKeywords.length > 0;

async function main(): Promise<void> {
  const errors: string[] = [];

  let discovered = 0;
  let successful = 0;
  let skipped = 0;
  let failed = 0;

  // Open ONE writer for the entire export.
  // This truncates the old output once, then appends each section
  // through the same writer.
  const writer = Bun.file(outputPath).writer();

  try {
    const glob = new Bun.Glob("**/*");

    console.log(`Scanning: ${root}`);
    console.log(`Output:   ${outputPath}`);
    if (useKeywordFilter) {
      console.log(`Keywords: ${keywords.join(", ")}`);
    } else {
      console.log(`Keywords: (none — exporting all files)`);
    }

    for await (const entry of glob.scan({
      cwd: root,
      onlyFiles: true,
      dot: CONFIG.includeHidden,
      followSymlinks: false,
    })) {
      const normalizedEntry = normalize(entry);
      const segments = normalizedEntry.split("/");

      if (segments.some((segment) => excluded.has(segment))) {
        continue;
      }

      // Do not include the output file itself.
      if (normalizedEntry === outputPath) {
        continue;
      }

      const filename = segments[segments.length - 1];
      const dotIndex = filename.lastIndexOf(".");
      const extension =
        dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";

      if (!extensions.has(extension)) continue;

      discovered++;

      try {
        const content = await Bun.file(join(root, entry)).text();

        let matchedKeywords: string[] = [];
        if (useKeywordFilter) {
          const haystack = content.toLowerCase();
          matchedKeywords = keywords.filter((_, i) =>
            haystack.includes(lowerKeywords[i]),
          );

          if (matchedKeywords.length === 0) {
            skipped++;
            console.log(`[SKIP] ${normalizedEntry} (no keyword match)`);
            continue;
          }
        }

        const header = useKeywordFilter
          ? `\n\n${"=".repeat(90)}\n` +
            `FILE: ${normalizedEntry}\n` +
            `MATCHED KEYWORDS: ${matchedKeywords.join(", ")}\n` +
            `${"=".repeat(90)}\n\n`
          : `\n\n${"=".repeat(90)}\n` +
            `FILE: ${normalizedEntry}\n` +
            `${"=".repeat(90)}\n\n`;

        writer.write(header + content + "\n");

        successful++;
        console.log(
          useKeywordFilter
            ? `[OK] ${normalizedEntry} (matched: ${matchedKeywords.join(", ")})`
            : `[OK] ${normalizedEntry}`,
        );
      } catch (error: unknown) {
        failed++;

        const message =
          `${normalizedEntry}: ${
            error instanceof Error ? error.message : String(error)
          }`;

        errors.push(message);
        console.error(`[ERROR] ${message}`);

        if (!CONFIG.continueOnError) throw error;

        writer.write(`\n\n===== READ ERROR =====\n${message}\n`);
      }
    }
  } finally {
    // Flush and close the writer after all files have been processed.
    await writer.end();
  }

  if (errors.length > 0) {
    await Bun.write("./export-errors.txt", errors.join("\n\n"));
  }

  console.log("\n========== EXPORT SUMMARY ==========");
  console.log(`Files discovered: ${discovered}`);
  console.log(`Files read:       ${successful}`);
  console.log(`Files skipped:    ${skipped}`);
  console.log(`Files failed:     ${failed}`);
  console.log(`Output:           ${outputPath}`);
  console.log("====================================");
}

main().catch((error: unknown) => {
  console.error("Export failed:", error);
  process.exitCode = 1;
});