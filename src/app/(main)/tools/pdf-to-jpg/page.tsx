import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";
import { MotionDiv } from "@/components/motion-wrapper";
import { FileType, ShieldCheck, Zap, Image as ImageIcon } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "PDF to JPG Converter | Compressed & Fast | Comparlify",
    description: "Convert PDF pages to optimized JPG images instantly. Ideal for web use and social media. 100% private processing.",
    path: "/tools/pdf-to-jpg",
  });
}

export default function PdfToJpgPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <FileType className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Conversion Suite
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          PDF to <span className="text-primary italic">Optimized JPG</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Generate lightweight, high-performance JPG images from your PDF documents. Perfect for creators needing quick social assets or web-ready snapshots.
        </p>
      </MotionDiv>

      <UniversalConverter initialFrom="pdf" initialTo="jpg" />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Why <span className="text-primary italic">JPG</span> over PNG?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              While PNG is great for transparency and exact fidelity, **JPG** is the king of compression. A typical course handout converted to JPG is often **60-80% smaller** than its PNG counterpart, making it ideal for mobile users and fast-loading web pages.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/10">
              <Zap className="h-6 w-6 text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest leading-normal">
                Optimized for standard 72-150 DPI web rendering.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-card border border-border/10">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Privacy First
            </h3>
            <p className="text-sm text-muted-foreground font-medium italic">
                Just like all Comparlify tools, the conversion happens entirely in your browser memory. We never touch your data.
            </p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
