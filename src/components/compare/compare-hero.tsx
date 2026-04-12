import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Layers } from "lucide-react";

interface CompareHeroProps {
  subtitle?: string;
}

export function CompareHero({ subtitle }: CompareHeroProps) {
  return (
    <PageHero
      title={
        <>
          Strategic <span className="text-primary italic">Intelligence</span> Reports
        </>
      }
      subtitle={subtitle || "Zero fluff. Raw data. Side-by-side breakdowns to help you choose the winner for your business."}
    >
      <div className="flex flex-col items-center">
        <Breadcrumbs
          items={[{ name: "Home", href: "/" }, { name: "Compare" }]}
          className="mb-10 justify-center"
        />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-sm hover:scale-105 transition-transform duration-300">
          <Layers className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Tactical Assessment Hub
          </span>
        </div>
      </div>
    </PageHero>
  );
}
