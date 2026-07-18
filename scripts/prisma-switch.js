import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTargetProvider() {
  const envProvider = process.env.DATABASE_PROVIDER;
  if (envProvider) {
    const p = envProvider.toLowerCase().trim();
    if (p === "mongodb" || p === "mysql") {
      return p;
    }
  }

  const url = process.env.DATABASE_URL;
  if (url) {
    if (url.startsWith("mongodb://") || url.startsWith("mongodb+srv://")) {
      return "mongodb";
    }
  }

  return "mysql";
}

function compileSchema() {
  const provider = getTargetProvider();
  console.log(`\n[Prisma Switch] Detecting database configuration (Prisma v6)...`);
  console.log(`[Prisma Switch] Target Database Provider: ${provider.toUpperCase()}`);

  const schemaDir = path.join(process.cwd(), "prisma", "schema");
  if (!fs.existsSync(schemaDir)) {
    console.error(`[Prisma Switch] Error: Schema directory not found at ${schemaDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(schemaDir).filter(f => f.endsWith(".prisma"));

  // Ensure _base.prisma is read first to put generator and datasource blocks at the very top
  const baseIndex = files.indexOf("_base.prisma");
  if (baseIndex > -1) {
    files.splice(baseIndex, 1);
    files.unshift("_base.prisma");
  } else {
    console.warn(`[Prisma Switch] Warning: _base.prisma not found in ${schemaDir}`);
  }

  let combinedContent = "";
  for (const file of files) {
    const filePath = path.join(schemaDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    combinedContent += `\n// --- Merged from ${file} ---\n` + content + "\n";
  }

  if (provider === "mongodb") {
    // 1. Update the datasource block to use MongoDB, specify URL, and remove SQL relationMode
    combinedContent = combinedContent.replace(
      /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"mysql"[\s\S]*?\}/g,
      `datasource db {\n  provider     = "mongodb"\n  url          = env("DATABASE_URL")\n}`
    );

    // 2. Map all ID fields to _id (using a regex that is safe and captures whitespace variation)
    combinedContent = combinedContent.replace(
      /\bid\s+String\s+@id(\s+@default\(cuid\(\)\))?/g,
      `id String @id$1 @map("_id")`
    );

    // 3. Remove all SQL-specific @db.* annotations (like @db.Text, @db.LongText, etc.)
    combinedContent = combinedContent.replace(/@db\.[a-zA-Z0-9_]+(\([^)]*\))?/g, "");

    // 4. Convert implicit many-to-many relationships to MongoDB-compatible relation syntax
    combinedContent = combinedContent.replace(
      /model\s+ForumTopic\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model ForumTopic {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+NewsArticle\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model NewsArticle {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Post\s*\{([\s\S]*?)\bplatforms\s+Platform\[\]([\s\S]*?)\}/g,
      "model Post {\n$1platformIds String[]\n  platforms  Platform[] @relation(fields: [platformIds], references: [id])$2}"
    );

    // Successive updates on Platform:
    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bposts\s+Post\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1postIds String[]\n  posts  Post[] @relation(fields: [postIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bnewsArticles\s+NewsArticle\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1newsArticleIds String[]\n  newsArticles  NewsArticle[] @relation(fields: [newsArticleIds], references: [id])$2}"
    );

    combinedContent = combinedContent.replace(
      /model\s+Platform\s*\{([\s\S]*?)\bforumTopics\s+ForumTopic\[\]([\s\S]*?)\}/g,
      "model Platform {\n$1forumTopicIds String[]\n  forumTopics  ForumTopic[] @relation(fields: [forumTopicIds], references: [id])$2}"
    );
  } else {
    // Under mysql, make sure the datasource is explicitly mysql with relationMode prisma and specify URL
    combinedContent = combinedContent.replace(
      /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"(mysql|mongodb)"[\s\S]*?\}/g,
      `datasource db {\n  provider     = "mysql"\n  url          = env("DATABASE_URL")\n  relationMode = "prisma"\n}`
    );
  }

  // Ensure generator is always clean prisma-client-js in Prisma v6
  combinedContent = combinedContent.replace(
    /generator\s+client\s*\{[\s\S]*?provider\s*=\s*"prisma-client-js"[\s\S]*?\}/g,
    `generator client {\n  provider   = "prisma-client-js"\n}`
  );

  const outputPath = path.join(process.cwd(), "prisma", "schema.prisma");
  fs.writeFileSync(outputPath, combinedContent, "utf-8");
  console.log(`[Prisma Switch] Successfully compiled and generated ${outputPath}\n`);
}

compileSchema();
