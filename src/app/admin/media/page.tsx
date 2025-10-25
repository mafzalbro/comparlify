
'use server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploader } from "./_components/image-uploader";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GalleryHorizontal } from "lucide-react";

export default async function MediaLibraryPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <Button asChild variant="outline">
          <Link href="/media/gallery" target="_blank">
            <GalleryHorizontal className="mr-2 h-4 w-4" />
            View Media Gallery
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Image</CardTitle>
          <CardDescription>
            Drag and drop an image file here or click to select a file. Uploaded images will be available in the media gallery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
             <ImageUploader />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
