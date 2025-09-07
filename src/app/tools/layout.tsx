import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary/50">{children}</main>
      <Footer />
    </div>
  );
}
