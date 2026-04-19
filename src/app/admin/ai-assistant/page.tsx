import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  PenSquare,
  Zap,
  LayoutGrid,
  TrendingUp,
  BrainCircuit,
  MessageSquarePlus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion-wrapper";

export default async function AdminAiAssistantPage() {
  const tools = [
    {
      title: "Market Trends",
      description: "Discover trending topics and fresh ideas for your content.",
      icon: Search,
      href: "/admin/ai-assistant/market-scout",
      badge: "Discovery",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Article Assistant",
      description:
        "Generate professional drafts for your updates and blog posts.",
      icon: PenSquare,
      href: "/admin/ai-assistant/ghostwriter",
      badge: "Content Helper",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Platform Builder",
      description:
        "Generate complete platform profiles (Pros, Cons, Ratings) in seconds.",
      icon: LayoutGrid,
      href: "/admin/ai-assistant/platform-architect",
      badge: "Data Helper",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Comparison Crafter",
      description:
        "Draft structural head-to-head comparisons using AI analysis.",
      icon: TrendingUp,
      href: "/admin/ai-assistant/comparison-crafter",
      badge: "Deep Analysis",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Forum Assistant",
      description:
        "Draft professional and helpful responses for community members.",
      icon: MessageSquarePlus,
      href: "/admin/ai-assistant/community-replies",
      badge: "Engagement",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      title: "SEO Optimizer",
      description:
        "Refine meta titles, descriptions, and keywords for maximum ranking.",
      icon: Zap,
      href: "/admin/ai-assistant/seo-wizard",
      badge: "Performance",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest mb-4">
            AI Management Hub
          </Badge>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
            AI <span className="text-primary italic">Assistant</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Your helpful creative department. Generate expert content, explore
            markets, and scale your daily work with professional accuracy.
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/50 border border-border/10">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Assistant Status
            </p>
            <p className="text-sm font-bold">Ready to help</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tools.map((tool, idx) => (
          <MotionDiv
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={tool.href}>
              <Card className="h-full rounded-[2.5rem] border border-border/10 bg-card/40 backdrop-blur-md hover:bg-primary/5 hover:border-primary/20 transition-all duration-500 group overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 p-8 text-primary/5 select-none pointer-events-none -rotate-12 translate-x-4 -translate-y-4 group-hover:text-primary/10 transition-colors">
                  <tool.icon className="h-24 w-24" />
                </div>
                <CardHeader className="pt-10 px-8">
                  <div
                    className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}
                  >
                    <tool.icon className={`h-7 w-7 ${tool.color}`} />
                  </div>
                  <Badge className="w-fit mb-4 bg-background/50 text-[9px] font-black uppercase tracking-widest border-border/10">
                    {tool.badge}
                  </Badge>
                  <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                  <CardDescription className="text-base font-medium leading-relaxed mb-8">
                    {tool.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all">
                    Open Tool <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </MotionDiv>
        ))}
      </div>

      <Card className="mt-12 rounded-[3rem] border border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none">
                How it works
              </h3>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                These tools are fine-tuned specifically for Comparlify. They
                understand your site structure, your platform data, and
                your content style — so results are relevant from the start.
              </p>
              <div className="flex gap-4">
                <Badge
                  variant="outline"
                  className="px-6 py-2 rounded-full border-primary/30 text-primary font-black uppercase"
                >
                  Data Accuracy: 99.8%
                </Badge>
                <Badge
                  variant="outline"
                  className="px-6 py-2 rounded-full border-primary/30 text-primary font-black uppercase"
                >
                  Latency: &lt;1.2s
                </Badge>
              </div>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-background ring-1 ring-border/10">
              <div className="absolute inset-0 bg-grid-pattern-light opacity-20"></div>
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
                  <p className="font-black uppercase tracking-widest text-primary text-[10px]">
                    Smart Assistant Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
