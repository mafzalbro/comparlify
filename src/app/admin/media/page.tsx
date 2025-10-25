
'use server';

import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageGallery } from "./_components/image-gallery";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Image } from "@prisma/client";

async function getImages(): Promise<Image[]> {
  return prisma.image.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export default async function MediaLibraryPage() {
  const images = await getImages();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Gallery</h1>
        <Button asChild>
          <Link href="/admin/media/upload">
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Image
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Images</CardTitle>
          <CardDescription>
            Browse all uploaded images. Click an image to view details, edit, or delete it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ImageGallery initialImages={images} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
