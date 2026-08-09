import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Globe,
  User as UserIcon,
  BookOpen,
  Quote,
  Scale,
} from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { PremiumNewsletterForm } from "@/components/premium-newsletter-form";
import { MarkdownContent } from "@/components/markdown-content";
import { ManagedImage } from "@/components/managed-image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cache } from "react";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getContent } from "@/lib/content";
import { MotionDiv } from "@/components/motion-wrapper";
import { SchemaScript } from "@/components/schema-script";
import { Badge } from "@/components/ui/badge";

const getArticleBySlug = cache(async (slug: string) => {
  return prisma.newsArticle.findFirst({
    where: { slug, published: true },
    include: { author: true, platforms: true },
  });
});

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return generateSeoMetadata({
    title: article.title,
    description: article.content.substring(0, 160),
    image: article.image.replace("400/250", "800/400"),
    path: `/news/${article.slug}`,
  });
}

export const generateStaticParams = cache(async () => {
  const articles = await prisma.newsArticle.findMany({
    where: { published: true },
  });
  return articles.map((article: { slug: string }) => ({
    slug: article.slug,
  }));
});

export default async function NewsArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const [article, content, trendingComparisons] = await Promise.all([
    getArticleBySlug(slug),
    getContent(),
    prisma.comparison.findMany({
      where: { published: true },
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { platformA: true, platformB: true },
    }),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <SchemaScript
        schema={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.content.substring(0, 160),
          image: article.image,
          datePublished: article.createdAt.toISOString(),
          author: { "@type": "Person", name: article.author.name },
        }}
      />
      <header className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-20"></div>
        <div className="container mx-auto relative z-10 px-4 md:px-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "News", href: "/news" },
                  { name: article.title },
                ]}
                className="mb-8 justify-center"
              />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-12">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  News
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                {article.title}
              </h1>

              {article.platforms.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                  {article.platforms.map((platform: any) => (
                    <Badge
                      key={platform.id}
                      variant="outline"
                      className="px-4 py-1.5 rounded-full bg-primary/5 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                    >
                      <Link href={`/compare`}>{platform.name}</Link>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage
                      src={
                        article.author.image ??
                        `https://picsum.photos/100/100?random=${article.slug}`
                      }
                      alt={article.author.name ?? "Author"}
                    />
                    <AvatarFallback>
                      {article.author.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-sm text-foreground">
                      {article.author.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Author
                    </p>
                  </div>
                </div>

                <div className="h-4 w-px bg-border/20 hidden sm:block"></div>

                <div className="flex items-center gap-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {format(new Date(article.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </header>

      {/* Featured Image */}
      <section className="container mx-auto px-4 md:px-6 -mt-8 mb-12">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="relative aspect-[3/1] rounded-4xl overflow-hidden shadow-2xl group border-8 border-background ring-1 ring-border/10">
            <ManagedImage
              src={article.image.replace("400/250", "1920/1080")}
              alt={article.title}
              data-ai-hint={article.dataAiHint ?? ""}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 lg:to-transparent to-black/40"></div>
          </div>
        </MotionDiv>
      </section>

      {/* Article Content Layout */}
      <main className="container mx-auto max-w-6xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Sidebar Actions */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col items-center space-y-6">
              <ShareButton />
              <div className="h-px w-8 bg-border/20"></div>
              <Link href="/news">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-2xl"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </aside>

          {/* Main Text Content */}
          <article className="lg:col-span-8">
            <MarkdownContent content={article.content} />

            <div className="mt-24 pt-12 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary/5 p-4 rounded-3xl">
                  <Quote className="h-8 w-8 text-primary/40" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight uppercase tracking-wider text-muted-foreground">
                    End of Article
                  </p>
                  <p className="text-sm text-foreground/60">
                    Verified by our editorial team.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-2xl px-10 h-14 font-black gap-2 transition-all hover:scale-102"
              >
                <Link href="/news">
                  <ArrowLeft className="h-5 w-5" /> All News
                </Link>
              </Button>
            </div>
          </article>

          {/* Right Sidebar - Newsletter Hub */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-8">
              <div className="p-6 rounded-4xl bg-card/60 backdrop-blur-xl border border-primary/20 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 text-primary/5 -rotate-12 translate-x-4 -translate-y-4">
                  <BookOpen className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <PremiumNewsletterForm
                    buttonText="Get Notified"
                    containerClassName="flex-col gap-4 p-0 bg-transparent border-none shadow-none"
                    inputClassName="h-12 px-6 text-sm bg-background/50"
                    buttonClassName="h-12 w-full px-0"
                  />
                </div>
              </div>

              {trendingComparisons.length > 0 && (
                <div className="p-8 rounded-4xl bg-primary/5 border border-primary/20 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 text-primary/10 select-none pointer-events-none -rotate-12 translate-x-4 -translate-y-4">
                    <Scale className="h-24 w-24" />
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 uppercase tracking-widest text-[8px] font-black rounded-full mb-8 relative z-10">
                    Trending
                  </Badge>
                  <h3 className="text-2xl font-black text-foreground mb-10 relative z-10 leading-none">
                    Platform <br />
                    <span className="text-primary italic">Comparisons</span>
                  </h3>
                  <div className="space-y-6 relative z-10">
                    {trendingComparisons.map((comp: any) => (
                      <Link
                        key={comp.id}
                        href={`/compare/${comp.slug}`}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 hover:bg-background transition-all group/item border border-border/5"
                      >
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                            <ManagedImage
                              fill
                              src={comp.platformA.logoUrl}
                              alt={comp.platformA.name}
                              className="object-cover"
                            />
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden relative shadow-lg">
                            <ManagedImage
                              fill
                              src={comp.platformB.logoUrl}
                              alt={comp.platformB.name}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate group-hover/item:text-primary transition-colors">
                            {comp.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 rounded-4xl bg-secondary border border-border/10">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6 opacity-40">
                  Related News
                </h4>
                <div className="space-y-6">
                  {/* Placeholder for real related news if available, otherwise generic links */}
                  <div className="group cursor-pointer">
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">
                      Creator Economy
                    </p>
                    <Link
                      href="/blog"
                      className="font-bold leading-tight group-hover:text-primary transition-colors block"
                    >
                      Mastering the AI Creator Economy
                    </Link>
                  </div>
                  <div className="group cursor-pointer">
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">
                      E-Learning Updates
                    </p>
                    <Link
                      href="/news"
                      className="font-bold leading-tight group-hover:text-primary transition-colors block"
                    >
                      Global Pivot in E-Learning Standards
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
