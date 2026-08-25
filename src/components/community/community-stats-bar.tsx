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
      className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 p-6 md:p-8 bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors rounded-2xl shadow-md overflow-hidden relative"
    >
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 relative z-10 border-r border-border/20 pr-6 last:border-0">
        <p className="text-2xl font-black text-foreground italic">
          {stats.verifiedNodes.toLocaleString()}
        </p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Verified Nodes
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 relative z-10 border-r border-border/20 pr-6 last:border-0 text-primary">
        <p className="text-2xl font-black italic">
          {stats.activeSyncs.toLocaleString()}
        </p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Active Syncs
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 relative z-10 border-r border-border/20 pr-6 last:border-0">
        <p className="text-2xl font-black text-foreground italic">
          {stats.signalAccuracy}
        </p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Signal Accuracy
        </p>
      </div>
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2 relative z-10 pr-6 last:border-0">
        <div className="flex -space-x-3 mb-1">
          {[1, 2, 3].map((i) => (
            <Avatar key={i} className="h-8 w-8 ring-2 ring-card shadow-sm">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
              />
            </Avatar>
          ))}
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-black tracking-tighter ring-2 ring-card shadow-sm">
            +{stats.syncingNow}
          </div>
        </div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Syncing Now
        </p>
      </div>
    </MotionDiv>
  );
}
