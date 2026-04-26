
import type { User } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MarkdownContent } from '@/components/markdown-content';
import { VoteButtons } from './vote-buttons';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface TopicPostProps {
    id: string;
    author: User & { username?: string | null, stacks?: { isVerified: boolean }[] };
    content: string;
    createdAt: Date;
    isTopicPost?: boolean;
    votes?: number;
    userVote?: number;
}

export function TopicPost({
    id,
    author,
    content,
    createdAt,
    isTopicPost = false,
    votes = 0,
    userVote = 0
}: TopicPostProps) {
    const isVerified = author.stacks?.some(s => s.isVerified);

    return (
        <div className="flex gap-4 md:gap-8">
            <VoteButtons
                id={id}
                initialVotes={votes}
                userVote={userVote}
                type={isTopicPost ? "topic" : "post"}
                className="hidden md:flex mt-4"
            />

            <Card id={id} className={isTopicPost ? "flex-1 border-primary/20 overflow-hidden rounded-[2.5rem]" : "flex-1 overflow-hidden rounded-[2.5rem]"}>
                <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30 border-b border-border/10">
                    <div className="flex items-center gap-4">
                        <Link href={author.username ? `/u/${author.username}` : "#"} className="group">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-lg transition-transform group-hover:scale-105">
                                <AvatarImage src={author.image ?? undefined} alt={author.name ?? ''} />
                                <AvatarFallback className="font-black">{author.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={author.username ? `/u/${author.username}` : "#"}
                                    className="font-black text-foreground hover:text-primary transition-colors italic"
                                >
                                    {author.name}
                                </Link>
                                {isVerified && (
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest gap-1 py-0 px-2 h-5">
                                        <ShieldCheck className="h-2.5 w-2.5" /> Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                {author.username ? `@${author.username}` : 'Community Member'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" dateTime={createdAt.toISOString()}>
                            {format(createdAt, "MMM d, yyyy")}
                        </time>
                        <div className="md:hidden flex items-center gap-2">
                            <VoteButtons
                                id={id}
                                initialVotes={votes}
                                userVote={userVote}
                                type={isTopicPost ? "topic" : "post"}
                                className="flex-row gap-2"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 prose dark:prose-invert max-w-none prose-p:italic prose-p:text-muted-foreground prose-p:font-medium prose-p:leading-relaxed">
                    <MarkdownContent content={content} />

                    {isVerified && (
                        <div className="mt-12 pt-8 border-t border-border/10">
                            <Link
                                href={author.username ? `/u/${author.username}` : "/community/verified-stacks"}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                            >
                                View Creator Tech Stack <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
