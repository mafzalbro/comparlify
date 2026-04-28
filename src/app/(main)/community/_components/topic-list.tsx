
import Link from "next/link";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import type { ForumTopic, User } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

type TopicWithAuthorAndCounts = ForumTopic & { 
    author: User & { stacks?: { isVerified: boolean }[] },
    _count: { posts: number },
    votes?: { value: number }[]
};

interface TopicListProps {
    topics: TopicWithAuthorAndCounts[];
}

export function TopicList({ topics }: TopicListProps) {
    if (topics.length === 0) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                        <MessageSquare className="h-16 w-16 mb-4" />
                        <h3 className="text-xl font-semibold">No Topics Yet</h3>
                        <p className="mt-2 max-w-md">Be the first to start a conversation in this category!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <div className="space-y-4">
            {topics.map(topic => (
                <Card key={topic.id} className="hover:bg-accent/50 transition-colors">
                    <Link href={`/community/topic/${topic.id}`} className="block p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={topic.author.image ?? undefined} alt={topic.author.name ?? ''} />
                                    <AvatarFallback>{topic.author.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg text-foreground">{topic.title}</h3>
                                        {topic.author.stacks?.some(s => s.isVerified) && (
                                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground italic font-medium">
                                        By <span className="text-primary font-bold">{topic.author.name}</span> &bull; {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{topic._count.posts}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </Card>
            ))}
        </div>
    )
}
