
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Activity } from "../page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookText, MessageCircle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function renderActivity(activity: Activity) {
  switch (activity.type) {
    case 'POST':
      return (
        <>
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.author.image ?? ''} alt="Author" />
              <AvatarFallback>{activity.author.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                  New Post: <Link href={`/admin/blog/edit/${activity.id}`} className="hover:underline text-primary">{activity.title}</Link>
              </p>
              <p className="text-sm text-muted-foreground">
                by {activity.author.name}
              </p>
            </div>
            <div className="ml-auto font-medium text-sm text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</div>
        </>
      );
    case 'USER':
       return (
        <>
            <Avatar className="h-9 w-9">
                <AvatarImage src={activity.image ?? ''} alt="User" />
                <AvatarFallback>{activity.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                    New User Signup
                </p>
                <p className="text-sm text-muted-foreground">
                    {activity.name} ({activity.email})
                </p>
            </div>
             <div className="ml-auto font-medium text-sm text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</div>
        </>
       );
    case 'COMMENT':
        return (
            <>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.author.image ?? ''} alt="Author" />
                    <AvatarFallback>{activity.author.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        New Comment
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        "{activity.content}" on <Link href={`/blog/${activity.post.slug}`} className="hover:underline text-primary">{activity.post.title}</Link>
                    </p>
                </div>
                <div className="ml-auto font-medium text-sm text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</div>
            </>
        )
    default:
      return null;
  }
}

const ActivityIcon = ({ type }: { type: Activity['type']}) => {
    switch (type) {
        case 'POST': return <BookText className="h-4 w-4 text-muted-foreground" />;
        case 'USER': return <UserPlus className="h-4 w-4 text-muted-foreground" />;
        case 'COMMENT': return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
        default: return null;
    }
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          A feed of the most recent events across the site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div className="flex items-start" key={`${activity.type}-${activity.id}`}>
              <ActivityIcon type={activity.type} />
              <div className="ml-4 flex-1 flex items-center">
                 {renderActivity(activity)}
              </div>
            </div>
          ))}
           {activities.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No recent activity to display.</p>
                </div>
           )}
        </div>
      </CardContent>
    </Card>
  )
}
