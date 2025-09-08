
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPostPreview } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Post } from '@prisma/client';


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
            <div className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }
    
    if (!post || error) {
        return (
            <div className="text-center text-sm text-muted-foreground">
                Could not load preview.
            </div>
        );
    }

    const readTime = Math.ceil(post.content.split(/\s+/).length / 200);

    const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f0f0f0" offset="20%" />
          <stop stop-color="#e0e0e0" offset="50%" />
          <stop stop-color="#f0f0f0" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f0f0f0" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;

    const toBase64 = (str: string) =>
      typeof window === 'undefined'
        ? Buffer.from(str).toString('base64')
        : window.btoa(str);


    return (
        <Link href={`/blog/${slug}`} className="block">
            <Card className="border-none shadow-none">
                <div className="relative aspect-video">
                    <Image
                        src={post.image.replace('400/250', '400/225')}
                        alt={post.title}
                        fill
                        className="rounded-t-lg object-cover"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 225))}`}
                    />
                </div>
                <CardHeader>
                    <CardTitle className="text-base font-bold line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{readTime} min read</p>
                </CardContent>
            </Card>
        </Link>
    );
}
