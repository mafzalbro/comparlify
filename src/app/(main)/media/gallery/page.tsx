
'use server';

import prisma from "@/lib/prisma";
import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/breadcrumb';
import { ImageGallery } from '@/app/admin/media/_components/image-gallery';
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Image } from "@prisma/client";

export const metadata: Metadata = generateSeoMetadata({
  title: 'Image Gallery',
  description: 'A gallery of all uploaded images.',
  path: '/media/gallery',
});

async function getImages(): Promise<Image[]> {
  return prisma.image.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function GalleryPage() {
  const images = await getImages();

  return (
    <div className="bg-background">
      <section className="bg-secondary/30 border-b">
        <div className="container py-12 md:py-16 px-4 md:px-6">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Media Gallery' },
            ]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl md:text-6xl font-bold text-foreground">
              Media Gallery
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              A collection of all media uploaded to the site. Click an image to view details, edit, or delete it.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-4 md:px-6">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <ImageGallery initialImages={images} />
        </Suspense>
      </div>
    </div>
  );
}
