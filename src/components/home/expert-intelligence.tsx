import NextLink from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { MotionDiv } from "@/components/motion-wrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManagedImage } from "@/components/managed-image";
import type { Post, User } from "@prisma/client";

type PostWithAuthor = Post & { author: User };

interface ExpertIntelligenceProps {
  posts: PostWithAuthor[];
  description?: string;
}

export function ExpertIntelligence({
  posts,
  description,
}: ExpertIntelligenceProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-32 md:py-48 relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 shadow-sm">
              <BookOpen className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                Latest Articles
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Expert <span className="text-primary italic">Insights</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
              {description ||
                "Actionable advice and growth strategies for the modern course creator. Stay ahead with expert tips."}
            </p>
          </MotionDiv>
          <Button
            asChild
            variant="ghost"
            className="group h-14 px-8 rounded-2xl hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-xs transition-all"
          >
            <NextLink href="/blog">
              View Blog{" "}
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </NextLink>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post, index) => (
            <MotionDiv
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="flex flex-col h-full group overflow-hidden rounded-4xl border border-border/10 bg-card/20 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="relative overflow-hidden aspect-16/10">
                  <NextLink
                    href={`/blog/${post.slug}`}
                    className="block h-full"
                  >
                    <ManagedImage
                      src={post.image}
                      alt={post.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                      <span className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                        The Full Breakdown <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </NextLink>
                </div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    <span className="text-primary">{post.author.name}</span>
                    <span className="w-4 h-px bg-border/20"></span>
                    <span className="flex items-center gap-2 font-black uppercase tracking-widest">
                      <Clock className="h-3 w-3" /> 5 min read
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black leading-[1.1] group-hover:text-primary transition-colors duration-500 mb-4 line-clamp-2">
                    <NextLink
                      href={`/blog/${post.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {post.title}
                    </NextLink>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium mb-4">
                    {post.description}
                  </p>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] group/btn group-hover:translate-x-2 transition-transform duration-500">
                    Read Article <ArrowRight className="h-3 w-3" />
                  </div>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
