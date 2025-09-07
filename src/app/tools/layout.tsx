export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <main className="flex-1 bg-secondary/50">{children}</main>
  );
}
    