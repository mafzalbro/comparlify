
'use server';
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploader } from "./_components/image-uploader";
import { ImageGallery } from "./_components/image-gallery";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
        <h1 className="text-3xl font-bold">Media Library</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Image</CardTitle>
          <CardDescription>
            Drag and drop an image file here or click to select a file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Images</CardTitle>
        </CardHeader>
        <CardContent>
           <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ImageGallery initialImages={images} />
           </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
