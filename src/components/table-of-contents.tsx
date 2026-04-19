import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  content: string;
}

function escapeRegExp(string: string) {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  // This regex matches lines starting with ## or ###, followed by a space, and captures the text.
  const regex = /^(##|###)\s(.+)/gm;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length; // ## -> level 2, ### -> level 3
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    headings.push({ id, level, text });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);

  if (headings.length === 0) {
    return null;
  }

  // We need to add ids to the headings in the content for the links to work.
  // This is a bit of a hack, but it's the only way to do it without a full markdown AST parser on the server.
  let contentWithIds = content;
  headings.forEach((heading) => {
    const escapedText = escapeRegExp(heading.text);
    const headingRegex = new RegExp(
      `^(${"#".repeat(heading.level)}\\s${escapedText})$`,
      "m",
    );
    contentWithIds = contentWithIds.replace(
      headingRegex,
      `$1 {#${heading.id}}`,
    );
  });

  return (
    <div className="space-y-4">
      <h3 className="font-headline text-xl font-semibold">Table of Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              "text-muted-foreground hover:text-primary transition-colors",
              heading.level === 3 && "pl-4",
            )}
          >
            <a href={`#${heading.id}`}>{heading.text.replace(/\*/g, "")}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
