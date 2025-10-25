
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { revalidatePath } from "next/cache";

async function getImages(): Promise<Image[]> {
  return prisma.image.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function refreshAction() {
    'use server';
    revalidatePath('/admin/media');
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
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
             <ImageUploader />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Uploaded Images</CardTitle>
                    <CardDescription>Click an image to view details, edit, or delete it.</CardDescription>
                </div>
                <form action={refreshAction}>
                    <Button variant="outline" size="sm">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Refresh Gallery
                    </Button>
                </form>
            </div>
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
