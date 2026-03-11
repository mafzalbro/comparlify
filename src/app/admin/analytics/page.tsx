import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MousePointer2, ExternalLink } from "lucide-react";
import { ManagedImage } from "@/components/managed-image";

async function getAnalytics() {
  const platforms = await prisma.platform.findMany({
    include: {
      _count: {
        select: { affiliateClicks: true },
      },
    },
    orderBy: {
      affiliateClicks: {
        _count: "desc",
      },
    },
  });

  const totalClicks = platforms.reduce(
    (acc, p) => acc + p._count.affiliateClicks,
    0,
  );

  return { platforms, totalClicks };
}

export default async function AnalyticsPage() {
  const { platforms, totalClicks } = await getAnalytics();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Revenue <span className="text-primary italic">Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Track outbound affiliate traffic and platform performance
          </p>
        </div>
        <Badge className="px-6 py-2 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest">
          Live Tracking Enabled
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Total Clicks
            </CardTitle>
            <MousePointer2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalClicks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-border/10 col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Click Intelligence (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Note: In a real app, you would aggregate this from the DB */}
            <div className="h-[120px] w-full bg-primary/5 rounded-xl border border-primary/10 flex items-end gap-2 p-4">
              {[45, 67, 89, 120, 95, 140, 180].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary rounded-t-md transition-all duration-1000"
                  style={{ height: `${(h / 180) * 100}%` }}
                  title={`${h} clicks`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/10 bg-card/20 overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border/10 px-6 py-8">
          <CardTitle className="text-xl font-black">
            Affiliate Performance Breakdown
          </CardTitle>
          <CardDescription>Detailed click counts per platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/10 font-black uppercase tracking-widest text-[10px]">
                <TableHead className="w-[300px] border-r border-border/10">
                  Platform
                </TableHead>
                <TableHead className="text-center border-r border-border/10">
                  Clicks
                </TableHead>
                <TableHead className="text-center border-r border-border/10">
                  Market Share
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => {
                const share =
                  totalClicks > 0
                    ? (
                        (platform._count.affiliateClicks / totalClicks) *
                        100
                      ).toFixed(1)
                    : "0";

                return (
                  <TableRow
                    key={platform.id}
                    className="group hover:bg-primary/5 border-border/10 transition-colors"
                  >
                    <TableCell className="font-medium p-4 border-r border-border/10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white p-1 border border-border/10 flex items-center justify-center overflow-hidden">
                          <ManagedImage
                            src={platform.logoUrl}
                            alt={platform.name}
                            width={40}
                            height={40}
                            className="object-contain grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">
                            {platform.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                            {platform.website}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-xl border-r border-border/10">
                      {platform._count.affiliateClicks}
                    </TableCell>
                    <TableCell className="text-center border-r border-border/10">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {share}%
                        </span>
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={platform.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
              {platforms.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground italic"
                  >
                    No clicks recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
