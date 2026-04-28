
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Globe, Twitter, Linkedin, MessageSquare, List } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { StackCard } from "@/components/verification/stack-card";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUserProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      stacks: {
        where: { isVerified: true },
        include: { platforms: { include: { platform: true } } },
      },
      forumTopics: {
        where: { status: "APPROVED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: true, _count: { select: { posts: true } } },
      },
      forumPosts: {
        where: { status: "APPROVED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { topic: { include: { category: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return {};

  return generateSeoMetadata({
    title: `${user.name} (@${user.username}) - Creator Profile`,
    description: user.bio || `Check out ${user.name}'s verified stack and community contributions on Comparlify.`,
    path: `/u/${username}`,
  });
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) notFound();

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Profile Header */}
      <div className="relative h-64 bg-linear-to-r from-primary/20 to-secondary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="relative -mt-32 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <Avatar className="h-48 w-48 border-8 border-background rounded-[3rem] shadow-2xl">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="text-5xl font-black">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
                {user.stacks.some(s => s.isVerified) && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified Creator
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground font-medium italic">@{user.username}</p>
            </div>

            <div className="flex gap-4 mb-4">
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-card border border-border/10 hover:border-primary/50 transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-card border border-border/10 hover:border-primary/50 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {user.linkedin && (
                <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-card border border-border/10 hover:border-primary/50 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
            {/* Sidebar: Bio & Stats */}
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-border/10 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase tracking-widest italic">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed italic">
                    {user.bio || "This creator hasn't added a bio yet."}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-border/10 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase tracking-widest italic">Signal Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30">
                    <span className="text-sm font-bold text-muted-foreground italic">Topics Started</span>
                    <span className="text-xl font-black">{user.forumTopics.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30">
                    <span className="text-sm font-bold text-muted-foreground italic">Expert Replies</span>
                    <span className="text-xl font-black">{user.forumPosts.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content: Stacks & Activity */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="stacks" className="w-full">
                <TabsList className="bg-transparent border-b border-border/10 w-full justify-start rounded-none h-12 gap-8 mb-8">
                  <TabsTrigger value="stacks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase tracking-widest text-xs gap-2">
                    <List className="h-4 w-4" /> Verified Stacks
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-black uppercase tracking-widest text-xs gap-2">
                    <MessageSquare className="h-4 w-4" /> Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stacks" className="mt-0">
                  {user.stacks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.stacks.map((stack) => (
                        <StackCard key={stack.id} stack={stack} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center rounded-[3rem] bg-muted/20 border border-dashed border-border/20">
                      <p className="text-sm text-muted-foreground italic font-medium">No verified stacks published yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-0 space-y-6">
                  {user.forumTopics.length === 0 && user.forumPosts.length === 0 ? (
                    <div className="py-20 text-center rounded-[3rem] bg-muted/20 border border-dashed border-border/20">
                      <p className="text-sm text-muted-foreground italic font-medium">No community activity found.</p>
                    </div>
                  ) : (
                    <>
                      {user.forumTopics.map((topic) => (
                        <Card key={topic.id} className="rounded-3xl border-border/10 hover:border-primary/30 transition-colors">
                          <Link href={`/community/topic/${topic.id}`} className="block p-6">
                            <Badge className="mb-4 bg-primary/10 text-primary border-none text-[10px] uppercase font-black tracking-widest">
                              {topic.category.name}
                            </Badge>
                            <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium italic">
                              <span>{formatDistanceToNow(topic.createdAt, { addSuffix: true })}</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> {topic._count.posts} replies
                              </span>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
