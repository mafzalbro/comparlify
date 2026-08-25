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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {categories.map((category, index) => {
        const topicCount = category.topics.length;
        const postCount = category.topics.reduce(
          (sum, topic) => sum + topic._count.posts + 1,
          0,
        );

        return (
          <MotionDiv
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Card className="h-full group overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md hover:border-border/60 transition-colors shadow-md flex flex-col relative">
              <CardHeader className="p-6 pb-4 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar
                        key={i}
                        className="h-7 w-7 ring-2 ring-card shadow-xs"
                      >
                        <AvatarImage
                          src={`https://picsum.photos/100/100?random=${index}${i}`}
                        />
                      </Avatar>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl font-extrabold tracking-tight mb-2 leading-snug group-hover:text-primary transition-colors">
                  <NextLink
                    href={`/community/category/${category.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {category.name}
                  </NextLink>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">
                  {category.description ||
                    "Join the discussion and share insights with other platform users."}
                </CardDescription>
              </CardHeader>

              <CardFooter className="p-6 pt-0 mt-auto relative z-10">
                <div className="w-full flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/20 backdrop-blur-xs">
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-lg font-black text-foreground italic">
                          {topicCount}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
                        Topics
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-black text-foreground italic">
                        {postCount}
                      </span>
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest leading-none">
                        Posts
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20 group-hover:translate-x-1.5 transition-transform duration-300">
                    <ChevronsRight className="h-4 w-4" />
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
