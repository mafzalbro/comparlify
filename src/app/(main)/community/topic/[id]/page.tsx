
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Breadcrumbs } from '@/components/breadcrumb';
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { auth } from '@/lib/auth';
import { TopicPost } from '../../_components/topic-post';
import { ReplyForm } from '../../_components/reply-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';


const getTopic = cache(async (id: string) => {
    return prisma.forumTopic.findUnique({
        where: { id },
        include: {
            author: true,
            category: true,
            posts: {
                where: { status: 'APPROVED' },
                include: { author: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    });
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const topic = await getTopic(params.id);
    if (!topic) return {};

    return generateSeoMetadata({
        title: topic.title,
        description: topic.content.substring(0, 150),
        path: `/community/topic/${topic.id}`
    });
}

export default async function TopicPage({ params }: { params: { id: string } }) {
    const [topic, session] = await Promise.all([
        getTopic(params.id),
        auth()
    ]);

    if (!topic) notFound();

    const canView = topic.status === 'APPROVED' || session?.user?.role === 'ADMIN' || session?.user?.id === topic.authorId;

    if (!canView) notFound();

    return (
        <div className="container py-12 max-w-4xl">
            <Breadcrumbs 
                items={[
                    { name: 'Home', href: '/' },
                    { name: 'Community', href: '/community' },
                    { name: topic.category.name, href: `/community/category/${topic.category.slug}` },
                    { name: topic.title }
                ]}
                className="mb-8"
            />
            {topic.status !== 'APPROVED' && (
                <Alert variant="destructive" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
                    <ShieldAlert className="h-4 w-4 !text-yellow-600" />
                    <AlertTitle>Under Review</AlertTitle>
                    <AlertDescription>
                        This topic is currently pending approval and is not visible to the public.
                    </AlertDescription>
                </Alert>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <Badge variant="secondary">{topic.category.name}</Badge>
                    {topic.status !== 'APPROVED' && <Badge variant="destructive">{topic.status}</Badge>}
                </div>
                <h1 className="text-4xl font-bold font-headline mt-4">{topic.title}</h1>
            </div>

            <div className="space-y-6">
                <TopicPost 
                    id={topic.id}
                    author={topic.author}
                    content={topic.content}
                    createdAt={topic.createdAt}
                    isTopicPost={true}
                />

                {topic.posts.map(post => (
                    <TopicPost 
                        key={post.id}
                        id={post.id}
                        author={post.author}
                        content={post.content}
                        createdAt={post.createdAt}
                    />
                ))}
            </div>

            <div className="mt-12">
                <h2 className="font-headline text-2xl font-bold mb-4">Post a Reply</h2>
                <ReplyForm topicId={topic.id} session={session} />
            </div>
        </div>
    );
}
