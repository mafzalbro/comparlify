
import type { User } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MarkdownContent } from '@/components/markdown-content';

interface TopicPostProps {
    id: string;
    author: User;
    content: string;
    createdAt: Date;
    isTopicPost?: boolean;
}

export function TopicPost({ id, author, content, createdAt, isTopicPost = false }: TopicPostProps) {
    return (
        <Card id={id} className={isTopicPost ? "border-primary/20" : ""}>
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={author.image ?? undefined} alt={author.name ?? ''} />
                        <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{author.name}</span>
                </div>
                <time className="text-sm text-muted-foreground" dateTime={createdAt.toISOString()}>
                    {format(createdAt, "MMMM d, yyyy 'at' h:mm a")}
                </time>
            </CardHeader>
            <CardContent className="p-6">
                <MarkdownContent content={content} />
            </CardContent>
        </Card>
    )
}
