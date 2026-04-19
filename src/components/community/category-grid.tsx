import { MotionDiv } from "@/components/motion-wrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Zap, ChevronsRight, MessageCircle } from "lucide-react";
import NextLink from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  topics: {
    id: string;
    _count: {
      posts: number;
    };
  }[];
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-48 rounded-[5rem] border-2 border-dashed border-border/10 bg-secondary/5"
      >
        <MessageCircle className="mx-auto h-24 w-24 text-muted-foreground/10 mb-8" />
        <h3 className="text-4xl font-black mb-6 uppercase tracking-tight">
          No Categories Yet
        </h3>
        <p className="text-xl text-muted-foreground max-w-md mx-auto font-medium">
          Categories are being set up. Check back shortly.
        </p>
      </MotionDiv>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {categories.map((category, index) => {
        const topicCount = category.topics.length;
        const postCount = category.topics.reduce(
          (sum, topic) => sum + topic._count.posts + 1,
          0,
        );

        return (
          <MotionDiv
            key={category.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full group overflow-hidden rounded-[2.5rem] border border-border/10 bg-card/20 backdrop-blur-3xl shadow-2xl transition-all duration-700 hover:shadow-primary/5 hover:border-primary/20 flex flex-col relative">
              <div className="absolute top-0 right-0 p-12 text-primary/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <MessageSquare className="h-48 w-48" />
              </div>

              <CardHeader className="p-10 md:p-12 pb-6 relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 shadow-xl shadow-primary/5">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar
                        key={i}
                        className="h-10 w-10 ring-4 ring-card shadow-lg"
                      >
                        <AvatarImage
                          src={`https://picsum.photos/100/100?random=${index}${i}`}
                        />
                      </Avatar>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-black tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors">
                  <NextLink
                    href={`/community/category/${category.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {category.name}
                  </NextLink>
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed font-medium max-w-md">
                  {category.description ||
                    "Join the discussion and share insights with other platform users."}
                </CardDescription>
              </CardHeader>

              <CardFooter className="p-10 md:p-12 pt-0 mt-auto relative z-10">
                <div className="w-full flex items-center justify-between p-6 bg-background/40 rounded-4xl border border-border/10 backdrop-blur-sm group-hover:border-primary/20 transition-all">
                  <div className="flex gap-12">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-primary animate-pulse" />
                        <span className="text-2xl font-black text-foreground italic">
                          {topicCount}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
                        Topics
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-2xl font-black text-foreground italic">
                        {postCount}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-none">
                        Posts
                      </span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 group-hover:translate-x-3 transition-transform duration-500">
                    <ChevronsRight className="h-6 w-6" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          </MotionDiv>
        );
      })}
    </div>
  );
}
