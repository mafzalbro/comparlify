import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ManagedImage } from "@/components/managed-image";
import {
  BookText,
  GitCompareArrows,
  ArrowRight,
  Clock,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import type { Post, Comparison, Platform } from "@prisma/client";

type PopulatedComparison = Comparison & {
  platformA: Platform;
  platformB: Platform;
};

export function PostResultCard({ post }: { post: any }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-xl border-border/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-4xl">
        <Link
          href={`/blog/${post.slug}`}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6"
        >
          <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0">
            <ManagedImage
              src={post.image}
              alt={post.title}
              data-ai-hint={post.dataAiHint ?? ""}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
              <Badge className="bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[8px] border-none">
                Dispatch Entry
              </Badge>
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookText className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Research Report
              </span>
              <span className="w-4 h-px bg-border/20"></span>
              {post.category && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {post.category.name}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black font-headline mb-3 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-base line-clamp-2 mb-6 leading-relaxed">
              {post.description}
            </p>
            <div className="flex items-center gap-6 mt-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform">
                Full Brief <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </MotionDiv>
  );
}

export function ComparisonResultCard({
  comparison,
}: {
  comparison: PopulatedComparison;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-xl border-border/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[2.5rem]">
        <Link
          href={`/compare/${comparison.slug}`}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8"
        >
          <div className="relative flex items-center justify-center bg-secondary/30 rounded-2xl p-6 overflow-hidden min-h-[160px]">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="flex justify-around items-center w-full relative z-10 gap-2">
              <div className="w-2/5 flex flex-col items-center gap-2">
                <ManagedImage
                  src={comparison.platformA.logoUrl}
                  alt={`${comparison.platformA.name} logo`}
                  width={80}
                  height={24}
                  className="object-contain h-6 w-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="w-1/5 flex justify-center">
                <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                  <span className="font-mono text-[8px] font-black text-muted-foreground group-hover:text-primary transition-colors">
                    VS
                  </span>
                </div>
              </div>
              <div className="w-2/5 flex flex-col items-center gap-2">
                <ManagedImage
                  src={comparison.platformB.logoUrl}
                  alt={`${comparison.platformB.name} logo`}
                  width={80}
                  height={24}
                  className="object-contain h-6 w-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GitCompareArrows className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                War Room Briefing
              </span>
              <span className="w-4 h-px bg-border/20"></span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Battle Analysis
              </span>
            </div>
            <h3 className="text-2xl font-black font-headline mb-3 group-hover:text-primary transition-colors leading-tight">
              {comparison.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed pr-8">
              {comparison.summary}
            </p>
            <div className="flex items-center gap-6 mt-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Sparkles className="h-3 w-3 text-primary/60" />
                {format(new Date(comparison.createdAt), "MMM yyyy 'Edition'")}
              </div>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform">
                Tactical Breakdown <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </MotionDiv>
  );
}

export function NoResultsForTab({ type }: { type: "posts" | "comparisons" }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-24 rounded-[3rem] border-2 border-dashed border-border/20 bg-secondary/10"
    >
      <div className="p-6 bg-muted rounded-full w-fit mx-auto mb-6 opacity-40">
        <SearchIcon className="h-10 w-10" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Null Sector</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">
        No {type} found for this specific query calibration.
      </p>
    </MotionDiv>
  );
}
