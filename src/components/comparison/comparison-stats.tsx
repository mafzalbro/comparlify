import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MotionDiv } from "@/components/motion-wrapper";
import { Trophy } from "lucide-react";

interface StatItem {
  id: string;
  name: string;
  value1: string;
  value2: string;
}

interface ComparisonStatsProps {
  stats: StatItem[];
  platformAName: string;
  platformBName: string;
}

export function ComparisonStats({
  stats,
  platformAName,
  platformBName,
}: ComparisonStatsProps) {
  return (
    <section
      id="comparison-stats"
      className="container px-4 md:px-6 -mt-24 mb-32 relative z-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {stats.map((stat, index) => (
          <MotionDiv
            key={stat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full rounded-[2rem] bg-card/60 backdrop-blur-3xl border border-border/10 shadow-xl relative overflow-hidden group hover:shadow-primary/5 hover:border-primary/20 transition-all duration-700 flex flex-col">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">
                  {stat.name}
                </CardTitle>
                <Trophy className="h-5 w-5 text-primary opacity-50" />
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2 font-black">
                    <span className="text-sm uppercase tracking-tighter text-foreground">
                      {platformAName}
                    </span>
                    <span className="text-2xl text-primary">{stat.value1}</span>
                  </div>
                  <Progress
                    value={parseFloat(stat.value1) * 10}
                    className="h-2.5 bg-secondary/30"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2 font-black">
                    <span className="text-sm uppercase tracking-tighter text-foreground">
                      {platformBName}
                    </span>
                    <span className="text-2xl text-blue-500">
                      {stat.value2}
                    </span>
                  </div>
                  <Progress
                    value={parseFloat(stat.value2) * 10}
                    className="h-2.5 bg-secondary/30"
                  />
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
