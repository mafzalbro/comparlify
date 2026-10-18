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
import {
  TrendingUp,
  MousePointer2,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  Compass,
  MapPin,
  Zap,
} from "lucide-react";
import { ManagedImage } from "@/components/managed-image";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

async function getAnalytics() {
  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [platforms, recentClicks, weeklyClicks] = await Promise.all([
    prisma.platform.findMany({
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
    }),
    prisma.affiliateClick.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { platform: true },
    }),
    // Fetch clicks from the last 7 days for the chart
    prisma.affiliateClick.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  const totalClicks = platforms.reduce(
    (acc: number, p: any) => acc + p._count.affiliateClicks,
    0,
  );

  // ── Process Weekly Data for Chart ──
  // Create an array of the last 7 days (including today)
  const dailyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    };
  });

  // Aggregate the weekly clicks into the daily array
  weeklyClicks.forEach((click) => {
    const clickDate = click.createdAt.toISOString().split("T")[0];
    const dayData = dailyData.find((d) => d.dateStr === clickDate);
    if (dayData) dayData.count += 1;
  });

  // Find the highest click count to scale the chart properly
  const maxClicks = Math.max(...dailyData.map((d) => d.count), 1);

  return { platforms, totalClicks, recentClicks, dailyData, maxClicks };
}

export default async function AnalyticsPage() {
  const { platforms, totalClicks, recentClicks, dailyData, maxClicks } =
    await getAnalytics();

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
            {/* REAL DYNAMIC CHART */}
            <div className="h-[120px] w-full bg-primary/5 rounded-xl border border-primary/10 flex items-end gap-2 p-4 pt-8">
              {dailyData.map((d, i) => {
                // Calculate height percentage (minimum 2% so the bar is always visible)
                const heightPercent = Math.max((d.count / maxClicks) * 100, 2);
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                      {d.count} clicks
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full bg-primary rounded-t-md transition-all duration-1000 group-hover:bg-primary/80 cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 px-4">
              {dailyData.map((d, i) => (
                <span
                  key={i}
                  className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider flex-1 text-center"
                >
                  {d.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-border/10 bg-card/20 overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/10 px-6 py-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">
                Unified Traffic Audit Log
              </CardTitle>
              <CardDescription>
                Comprehensive real-time click intelligence
              </CardDescription>
            </div>
            <Badge className="bg-primary/20 text-primary border-transparent h-8 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              <Zap className="h-3 w-3 mr-2" /> Live Stream
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/10 font-black uppercase tracking-widest text-[10px]">
                  <TableHead className="w-[250px] border-r border-border/10 px-6">
                    Platform Entity
                  </TableHead>
                  <TableHead className="border-r border-border/10">
                    Environment
                  </TableHead>
                  <TableHead className="border-r border-border/10">
                    Location Node
                  </TableHead>
                  <TableHead className="border-r border-border/10">
                    Network
                  </TableHead>
                  <TableHead className="text-right px-6">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClicks.map((click: any) => (
                  <TableRow
                    key={click.id}
                    className="group hover:bg-primary/5 border-border/10 transition-colors"
                  >
                    <TableCell className="font-medium p-4 px-6 border-r border-border/10">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white p-1 border border-border/10 flex items-center justify-center overflow-hidden shrink-0">
                          <ManagedImage
                            src={click.platform.logoUrl}
                            alt={click.platform.name}
                            width={40}
                            height={40}
                            className="object-contain grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">
                            {click.platform.name}
                          </p>
                          <a
                            href={click.platform.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors max-w-[150px] truncate"
                          >
                            Visit Source <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-border/10 p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {click.device === "Mobile" ? (
                            <Smartphone className="h-3.5 w-3.5 text-primary/60" />
                          ) : (
                            <Monitor className="h-3.5 w-3.5 text-primary/60" />
                          )}
                          {click.device || "Unknown"}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                          {click.browser} / {click.os}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-border/10 p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <Globe className="h-3.5 w-3.5 text-primary/60" />
                          {click.country || "Unknown"}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{" "}
                          {click.city || "Unknown"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-border/10 p-4">
                      <div className="flex flex-col gap-1.5">
                        <div
                          className="text-xs font-mono font-medium truncate max-w-[180px]"
                          title={click.ip}
                        >
                          IP: {click.ip}
                        </div>
                        <div
                          className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate max-w-[180px]"
                          title={click.referrer}
                        >
                          <Compass className="h-3 w-3" /> {click.referrer}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 p-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-foreground">
                          {formatDistanceToNow(click.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                          <Clock className="h-3 w-3" /> Logged
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recentClicks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground italic"
                    >
                      No outbound traffic logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
