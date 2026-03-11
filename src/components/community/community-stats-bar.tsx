import { MotionDiv } from "@/components/motion-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

interface CommunityStatsBarProps {
  stats: {
    verifiedNodes: number;
    activeSyncs: number;
    signalAccuracy: string;
    syncingNow: number;
  };
}

export function CommunityStatsBar({ stats }: CommunityStatsBarProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 p-10 md:p-14 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-12 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-12 -translate-y-12">
        <Sparkles className="h-64 w-64" />
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 relative z-10 border-r border-border/10 pr-12 last:border-0">
        <p className="text-3xl font-black text-foreground italic">
          {stats.verifiedNodes.toLocaleString()}
        </p>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
          Verified Nodes
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 relative z-10 border-r border-border/10 pr-12 last:border-0 text-primary">
        <p className="text-3xl font-black italic">
          {stats.activeSyncs.toLocaleString()}
        </p>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
          Active Syncs
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 relative z-10 border-r border-border/10 pr-12 last:border-0">
        <p className="text-3xl font-black text-foreground italic">
          {stats.signalAccuracy}
        </p>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
          Signal Accuracy
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 relative z-10 pr-12 last:border-0">
        <div className="flex -space-x-4 mb-2">
          {[1, 2, 3].map((i) => (
            <Avatar key={i} className="h-12 w-12 ring-4 ring-card shadow-xl">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
              />
            </Avatar>
          ))}
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black tracking-tighter ring-4 ring-card shadow-xl">
            +{stats.syncingNow}
          </div>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
          Syncing Now
        </p>
      </div>
    </MotionDiv>
  );
}
