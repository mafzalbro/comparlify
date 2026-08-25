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
    <section className="py-10 md:py-16 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
          <MotionDiv
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-left space-y-1"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold">
                Latest Articles
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Expert <span className="text-primary italic">Insights</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl">
              {description ||
                "Actionable advice and growth strategies for the modern course creator. Stay ahead with expert tips."}
            </p>
          </MotionDiv>
          <Button
            asChild
            variant="ghost"
            className="group h-10 px-4 rounded-xl hover:bg-primary/10 text-primary font-extrabold uppercase tracking-widest text-[10px] transition-all"
          >
            <NextLink href="/blog">
              View Blog{" "}
              <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </NextLink>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post, index) => (
            <MotionDiv
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="flex flex-col h-full group overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md hover:border-border/60 transition-colors shadow-md">
                <div className="relative overflow-hidden aspect-16/10">
                  <NextLink
                    href={`/blog/${post.slug}`}
                    className="block h-full"
                  >
                    <ManagedImage
                      src={post.image}
                      alt={post.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </NextLink>
                </div>
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    <span className="text-primary">{post.author.name}</span>
                    <span className="w-3 h-px bg-border/40"></span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 5 min read
                    </span>
                  </div>
                  <CardTitle className="text-base font-extrabold leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    <NextLink
                      href={`/blog/${post.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {post.title}
                    </NextLink>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 flex-1">
                  <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed font-medium">
                    {post.description}
                  </p>
                </CardContent>
                <CardFooter className="p-5 pt-3">
                  <div className="flex items-center gap-2 text-primary font-extrabold uppercase tracking-widest text-[10px] group/btn group-hover:translate-x-1.5 transition-transform duration-300">
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
