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
import type { Post, User, Comment } from "@prisma/client";

export type Activity =
  | ({ type: "POST" } & Post & { author: User })
  | ({ type: "USER" } & User)
  | ({ type: "COMMENT" } & Comment & { author: User; post: Post });

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
  ] = await prisma.$transaction([
    prisma.platform.count(),
    prisma.feature.count(),
    prisma.user.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comparison.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true, post: true },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: subDays(new Date(), 6) } },
      select: { createdAt: true },
    }),
    prisma.affiliateClick.count(),
  ]);

  // Combine and sort activities
  const combinedActivities: Activity[] = [
    ...recentPosts.map((p) => ({ ...p, type: "POST" as const })),
    ...recentUsers.map((u) => ({ ...u, type: "USER" as const })),
    ...pendingComments.map((c) => ({ ...c, type: "COMMENT" as const })),
  ];

  const recentActivity = combinedActivities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const postCountsByDay = postsLast7Days.reduce(
    (acc, post) => {
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
            className="hover:bg-muted/50 transition-colors"
          >
            <Link href={card.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.count}</div>
                <p className="text-xs text-muted-foreground">
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
