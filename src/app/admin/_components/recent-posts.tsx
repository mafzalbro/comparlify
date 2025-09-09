
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post, User } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type PostWithAuthor = Post & { author: User };

export function RecentPosts({ posts }: { posts: PostWithAuthor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
        <CardDescription>
          The 5 most recent posts created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {posts.map((post) => (
            <div className="flex items-center" key={post.id}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.author.image ?? ''} alt="Avatar" />
                <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                    <Link href={`/admin/blog/edit/${post.id}`} className="hover:underline">{post.title}</Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  by {post.author.name}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
       <CardFooter>
        <Button className="w-full" asChild>
            <Link href="/admin/blog">
                View All Posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
