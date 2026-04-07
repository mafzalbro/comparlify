import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";
import { MotionDiv } from "@/components/motion-wrapper";
import { FileImage, ShieldCheck, Zap } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "PDF to Image Converter | High-Fidelity | Comparlify",
    description: "Convert PDF pages to high-resolution images instantly. Private, client-side processing ensuring your documents never leave your browser.",
    path: "/tools/pdf-to-image",
  });
}

export default function PdfToImagePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <FileImage className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Conversion Suite
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          PDF to <span className="text-primary italic">High-Res Images</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Transform static PDFs into editable, shareable image formats. Optimized for high-resolution rendering with 100% privacy—no server uploads required.
        </p>
      </MotionDiv>

      <UniversalConverter initialFrom="pdf" initialTo="png" />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2rem] bg-card border border-border/10">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Browser Only</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "Unlike other tools, we process everything on your hardware. Your sensitive documents stay exactly where they belong: with you."
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-card border border-border/10">
            <Zap className="h-8 w-8 text-primary mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Pure Velocity</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "Render dozens of pages in seconds. Multi-threaded processing ensures zero lag even with heavy graphical PDFs."
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
            <FileImage className="h-8 w-8 text-primary mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">High Fidelity</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "2x retina-ready scaling as standard. Perfect for presentations, social media sharing, or further design work."
            </p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
