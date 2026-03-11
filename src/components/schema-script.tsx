import Script from "next/script";

export function SchemaScript({ schema }: { schema: any }) {
  if (!schema) return null;

  return (
    <Script
      id="schema-org"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
