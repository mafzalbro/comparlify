import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSeoMetadata } from "@/lib/seo";
import { ManagedImage } from "@/components/managed-image";
import {
  ArrowRight,
  Newspaper,
  TrendingUp,
  Zap,
  Globe,
  Clock,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumb";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { getContent } from "@/lib/content";
import { MotionDiv } from "@/components/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { PremiumNewsletterForm } from "@/components/premium-newsletter-form";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "News & Announcements",
    description:
      "The latest product news, announcements, and articles from the Comparlify team.",
    path: "/news",
  });
}

async function getNewsArticles() {
  return prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });
}

export default async function NewsPage() {
  const [articles, content] = await Promise.all([
    getNewsArticles(),
    getContent(),
  ]);

  if (content["module.news.enabled"] === "false") {
    notFound();
  }

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="bg-background min-h-screen">
      {/* --- PREMIUM NEWS HERO --- */}
      <section className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30"></div>
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "News" }]}
                className="mb-8 justify-center"
              />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 shadow-sm">
                <Newspaper className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Newsroom
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none mb-6">
                Latest <span className="text-primary italic">News</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Product updates, announcements, and news from our team.
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4 md:px-6">
        {articles.length === 0 ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 rounded-[4rem] border-2 border-dashed border-border/20 bg-secondary/5"
          >
            <Newspaper className="mx-auto h-20 w-20 text-muted-foreground/20 mb-8" />
            <h3 className="text-4xl font-black mb-4">No news articles found</h3>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Check back later for new updates and announcements.
            </p>
          </MotionDiv>
        ) : (
          <div className="space-y-16">
            {/* --- FEATURED HERO ARTICLE --- */}
            {featuredArticle && (
              <MotionDiv
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <Link
                  href={`/news/${featuredArticle.slug}`}
                  className="block group"
                >
                  <div className="relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-border/10 glass dark:glass-dark shadow-[0_50px_100px_-30px_rgba(0,0,0,0.2)] hover:shadow-blue-500/5 transition-all duration-700 h-full lg:min-h-[400px]">
                    <div className="lg:col-span-7 relative h-[250px] lg:h-auto overflow-hidden">
                      <ManagedImage
                        src={featuredArticle.image.replace(
                          "400/250",
                          "1200/800",
                        )}
                        alt={featuredArticle.title}
                        data-ai-hint={featuredArticle.dataAiHint ?? ""}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        priority
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent"></div>
                      <div className="absolute top-10 left-10">
                        <Badge className="bg-primary px-5 py-2 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl ring-4 ring-primary/20">
                          Featured Story
                        </Badge>
                      </div>
                    </div>
                    <div className="lg:col-span-5 p-10 md:p-14 flex flex-col justify-center bg-card/20 backdrop-blur-sm">
                      <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-8">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />{" "}
                          {format(
                            new Date(featuredArticle.createdAt),
                            "MMM d, HH:mm",
                          )}
                        </span>
                        <span className="w-8 h-px bg-border/30"></span>
                        <span className="text-primary flex items-center gap-2">
                          <Newspaper className="h-4 w-4" /> Featured
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-500">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-lg md:text-xl text-muted-foreground mb-10 line-clamp-3 leading-relaxed">
                        {featuredArticle.content.substring(0, 180)}...
                      </p>
                      <div className="flex items-center text-primary font-black uppercase tracking-[0.2em] text-sm group-hover:translate-x-4 transition-transform duration-500">
                        Read Full Story <ArrowRight className="ml-4 h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              </MotionDiv>
            )}

            {/* --- DISPATCH SUB-HEADER --- */}
            <div className="flex items-center justify-between py-12 border-t border-border/10">
              <div className="flex items-center gap-6">
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  All <span className="italic text-primary">News</span>
                </h3>
              </div>
              <div className="bg-primary/5 px-6 py-3 rounded-2xl hidden md:flex items-center gap-3 text-xs font-black text-primary border border-primary/10 shadow-sm uppercase tracking-widest">
                <Newspaper className="h-4 w-4" /> {otherArticles.length} Stories
              </div>
            </div>

            {/* --- DISPATCH GRID --- */}
            {otherArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {otherArticles.map((article, index) => (
                  <MotionDiv
                    key={article.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col h-full group overflow-hidden rounded-4xl border border-border/10 bg-card/20 backdrop-blur-xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3">
                      <div className="relative overflow-hidden aspect-16/10">
                        <Link
                          href={`/news/${article.slug}`}
                          className="block h-full"
                        >
                          <ManagedImage
                            src={article.image}
                            alt={article.title}
                            data-ai-hint={article.dataAiHint ?? ""}
                            fill
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                            <span className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                              Read Full Story <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </Link>
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-background/90 text-foreground backdrop-blur-xl border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">
                            News
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                          <span className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />{" "}
                            {format(
                              new Date(article.createdAt),
                              "MMM d, HH:mm",
                            )}
                          </span>
                          <span className="w-4 h-px bg-border/20"></span>
                          <span className="text-primary uppercase tracking-[0.2em]">
                            Newsroom
                          </span>
                        </div>
                        <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors duration-500 mb-4 line-clamp-2">
                          <Link
                            href={`/news/${article.slug}`}
                            className="after:absolute after:inset-0"
                          >
                            {article.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-8 flex-1">
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                          {article.content.substring(0, 150)}...
                        </p>
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                        <Button
                          asChild
                          variant="ghost"
                          className="p-0 h-auto hover:bg-transparent text-primary font-black uppercase tracking-[0.2em] text-[10px] group/btn"
                        >
                          <Link
                            href={`/news/${article.slug}`}
                            className="flex items-center gap-3"
                          >
                            Read Full Story{" "}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-2" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </MotionDiv>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- PREMIUM NEWSLETTER BLOCK --- */}
      <section className="relative overflow-hidden bg-background py-32 mt-24">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-primary/2 pointer-events-none"></div>
          <div className="relative p-12 md:p-24 overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 text-primary/5 select-none pointer-events-none -rotate-12">
              <Newspaper className="h-[500px] w-[500px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-5 py-2 uppercase tracking-[0.3em] text-[10px] font-black rounded-full mb-8 shadow-sm">
                Newsletter
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-[1.1]">
                Stay Ahead of{" "}
                <span className="text-primary italic">The Curve</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed font-medium">
                Get the latest news and updates delivered to your inbox.
              </p>

              <PremiumNewsletterForm
                buttonText="Subscribe"
                containerClassName="bg-card/40 border-white/10 p-4 rounded-[2.5rem] shadow-2xl max-w-2xl"
              />
              <p className="mt-8 text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-black text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}
