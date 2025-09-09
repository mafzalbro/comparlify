
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPostPreview } from '@/app/actions/blog';
import { Skeleton } from './ui/skeleton';
import type { Post } from '@prisma/client';
import { ManagedImage } from './managed-image';


export function BlogPreviewCard({ slug }: { slug: string }) {
    const [post, setPost] = useState<Post | null | undefined>(undefined);
    const [error, setError] = useState(false);

    useEffect(() => {
        getPostPreview(slug)
            .then(data => setPost(data))
            .catch(() => setError(true));
    }, [slug]);

    if (post === undefined) {
        return (
            <div className="space-y-3 p-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        );
    }
    
    if (!post || error) {
        return (
            <div className="text-center text-sm text-muted-foreground p-4">
                Could not load preview.
            </div>
        );
    }

    return (
        <Link href={`/blog/${slug}`} className="block group">
           <div className="overflow-hidden rounded-md">
                <div className="relative aspect-video">
                    <ManagedImage
                        src={post.image.replace('400/250', '400/225')}
                        alt={post.title}
                        data-ai-hint={post.dataAiHint ?? ''}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-3 bg-card">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
                </div>
           </div>
        </Link>
    );
}
