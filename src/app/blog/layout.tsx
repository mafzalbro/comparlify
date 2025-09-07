export default function BlogLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <main className="flex-1">
          {children}
        </main>
    );
  }
    