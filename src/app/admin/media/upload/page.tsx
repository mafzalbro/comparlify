
'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUploader } from "../_components/image-uploader";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MediaUploadPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/admin/media">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Gallery
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
