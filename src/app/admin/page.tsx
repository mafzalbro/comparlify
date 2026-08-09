import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PenSquare,
  Table,
  Users,
  MessageCircle,
  GitCompareArrows,
  Zap,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { subDays, format, eachDayOfInterval } from "date-fns";
import { PostsChart } from "./_components/posts-chart";
import { RecentActivity } from "./_components/recent-activity";
import Link from "next/link";
import type { Post, User, Comment, Platform, AffiliateClick } from "@prisma/client";

export type Activity =
  | ({ type: "POST" } & Post & { author: User })
  | ({ type: "USER" } & User)
  | ({ type: "COMMENT" } & Comment & { author: User; post: Post })
  | ({ type: "AFFILIATE_CLICK" } & AffiliateClick & { platform: Platform });

async function getDashboardStats() {
  const [
    platformCount,
    featureCount,
    userCount,
    pendingCommentCount,
    comparisonCount,
    recentPosts,
    recentUsers,
    pendingComments,
    postsLast7Days,
    totalAffiliateClicks,
    recentClicks,
  ] = await prisma.$transaction([
    (await prisma.platform)?.count() ?? Promise.resolve(0),
    (await prisma.feature)?.count() ?? Promise.resolve(0),
    (await prisma.user)?.count() ?? Promise.resolve(0),
    (await prisma.comment)?.count({ where: { status: "PENDING" } }) ??
      Promise.resolve(0),
    (await prisma.comparison)?.count() ?? Promise.resolve(0),
    (await prisma.post)?.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }) ?? Promise.resolve([]),
    prisma.user?.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }) ?? Promise.resolve([]),
    prisma.comment?.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true, post: true },
    }) ?? Promise.resolve([]),
    prisma.post?.findMany({
      where: { createdAt: { gte: subDays(new Date(), 6) } },
      select: { createdAt: true },
    }) ?? Promise.resolve([]),
    (prisma as any).affiliateClick?.count() ?? Promise.resolve(0),
    (prisma as any).affiliateClick?.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { platform: true },
    }) ?? Promise.resolve([]),
  ]);

  // Combine and sort activities
  const combinedActivities: Activity[] = [
    ...recentPosts.map((p: any) => ({ ...p, type: "POST" as const })),
    ...recentUsers.map((u: any) => ({ ...u, type: "USER" as const })),
    ...pendingComments.map((c: any) => ({ ...c, type: "COMMENT" as const })),
    ...recentClicks.map((c: any) => ({ ...c, type: "AFFILIATE_CLICK" as const })),
  ];

  const recentActivity = combinedActivities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const postCountsByDay = postsLast7Days.reduce(
    (acc: Record<string, number>, post: any) => {
      const day = format(post.createdAt, "yyyy-MM-dd");
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const chartData = dateRange.map((date) => {
    const day = format(date, "yyyy-MM-dd");
    return {
      date: format(date, "MMM d"),
      posts: postCountsByDay[day] || 0,
    };
  });

  return {
    platformCount,
    featureCount,
    userCount,
    pendingCommentCount,
    comparisonCount,
    recentActivity,
    chartData,
    totalAffiliateClicks,
  };
}

export default async function AdminDashboardPage() {
  const {
    platformCount,
    featureCount,
    userCount,
    pendingCommentCount,
    comparisonCount,
    recentActivity,
    chartData,
    totalAffiliateClicks,
  } = await getDashboardStats();

  const statsCards = [
    {
      href: "/admin/platforms",
      title: "Total Platforms",
      count: platformCount,
      Icon: Table,
      description: "Currently being compared",
    },
    {
      href: "/admin/comparisons",
      title: "Total Comparisons",
      count: comparisonCount,
      Icon: GitCompareArrows,
      description: "Published comparisons",
    },
    {
      href: "/admin/analytics",
      title: "Affiliate Clicks",
      count: totalAffiliateClicks,
      Icon: Zap,
      description: "Total outbound traffic",
    },
    {
      href: "/admin/users",
      title: "Total Users",
      count: userCount,
      Icon: Users,
      description: "Registered in the system",
    },
    {
      href: "/admin/comments?status=PENDING",
      title: "Pending Comments",
      count: pendingCommentCount,
      Icon: MessageCircle,
      description: "Awaiting moderation",
    },
  ];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="group relative overflow-hidden rounded-3xl border border-border/10 bg-card/40 backdrop-blur-xl shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <Link href={card.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <card.Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter mb-1">{card.count}</div>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <PostsChart data={chartData} />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
