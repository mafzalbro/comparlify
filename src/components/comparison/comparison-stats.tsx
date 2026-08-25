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
      className="container mx-auto px-4 md:px-6 -mt-12 mb-16 relative z-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <MotionDiv
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Card className="h-full rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-border/60 transition-colors shadow-md relative overflow-hidden group flex flex-col">
              <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {stat.name}
                </CardTitle>
                <Trophy className="h-4 w-4 text-primary opacity-60" />
              </CardHeader>
              <CardContent className="p-5 pt-2 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end font-extrabold">
                    <span className="text-xs uppercase tracking-tight text-foreground">
                      {platformAName}
                    </span>
                    <span className="text-lg text-primary">{stat.value1}</span>
                  </div>
                  <Progress
                    value={parseFloat(stat.value1) * 10}
                    className="h-2 bg-secondary/30"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end font-extrabold">
                    <span className="text-xs uppercase tracking-tight text-foreground">
                      {platformBName}
                    </span>
                    <span className="text-lg text-blue-500">
                      {stat.value2}
                    </span>
                  </div>
                  <Progress
                    value={parseFloat(stat.value2) * 10}
                    className="h-2 bg-secondary/30"
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
