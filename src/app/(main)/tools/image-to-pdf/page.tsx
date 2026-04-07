import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { UniversalConverter } from "@/components/tools/converters/universal-converter";
import { MotionDiv } from "@/components/motion-wrapper";
import { FileStack, ShieldCheck, Zap, Scissors } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Image to PDF Converter | Instant Assembly | Comparlify",
    description: "Combine multiple images into a single, professional PDF document. Private, browser-based assembly with zero data logging.",
    path: "/tools/image-to-pdf",
  });
}

export default function ImageToPdfPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
          <FileStack className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Conversion Suite
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Image to <span className="text-primary italic">PDF Assembler</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl font-medium">
          Merge your photos, screenshots, and designs into a single PDF doc. Optimized for mobile-viewing and high-fidelity archival.
        </p>
      </MotionDiv>

      <UniversalConverter initialFrom="png" initialTo="pdf" />

      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 pt-20 border-t border-border/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2rem] bg-card border border-border/10">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Zero Logs</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "We never see your images. The entire 'stitching' process happens in your local RAM, bypassing our servers entirely."
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-card border border-border/10">
            <Zap className="h-8 w-8 text-primary mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Instant Save</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "No waiting for server queues. Your PDF is ready the moment you hit generate, regardless of file count."
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
            <Scissors className="h-8 w-8 text-primary mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Auto-Resize</h3>
            <p className="text-sm text-muted-foreground font-medium italic">
              "Intelligent aspect ratio handling ensures your images fill the page perfectly without awkward cropping."
            </p>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
