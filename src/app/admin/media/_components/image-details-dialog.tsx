
'use client';

import { useContext, useEffect, useState } from "react";
import { type Image } from "@prisma/client";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ManagedImage } from "@/components/managed-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, Save, Trash2, TriangleAlert, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ImageGalleryContext } from "./image-gallery-context";
import { updateImageDetailsAction, deleteImageAction, getImageUsage, type ImageUsage } from "@/app/actions/media";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
}

function UsageSkeleton() {
    return (
        <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2 pt-2">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-full rounded" />
            </div>
        </div>
    )
}

function UsageDisplay({ usages, isLoading }: { usages: ImageUsage[], isLoading: boolean }) {
  if (isLoading) {
    return <UsageSkeleton />;
  }

  if (usages.length === 0) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="max-h-56">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>Image In Use</AlertTitle>
      <AlertDescription>
        This image is currently used in the following places. Renaming or deleting it will cause broken images.
      </AlertDescription>
      <ScrollArea className="h-24 mt-2">
        <ul className="text-sm space-y-1 pl-4">
          {usages.map((usage, index) => (
            <li key={index} className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{usage.type}:</span> {usage.title}
              </div>
              <Button asChild variant="ghost" size="sm">
                  <Link href={usage.url} target="_blank">
                      <ExternalLink className="h-3 w-3 mr-1" /> Edit
                  </Link>
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </Alert>
  );
}

export function ImageDetailsDialog() {
  const context = useContext(ImageGalleryContext);
  const { toast } = useToast();
  
  const [altText, setAltText] = useState('');
  const [baseFilename, setBaseFilename] = useState('');
  const [extension, setExtension] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [usages, setUsages] = useState<ImageUsage[]>([]);
  const [isLoadingUsages, setIsLoadingUsages] = useState(false);

  useEffect(() => {
    if (context?.selectedImage) {
      const { altText, filename, url } = context.selectedImage;
      const parts = filename.split('.');
      const ext = parts.pop() || '';
      const base = parts.join('.');
      
      setAltText(altText || '');
      setBaseFilename(base);
      setExtension(ext);

      setIsLoadingUsages(true);
      getImageUsage(url).then(foundUsages => {
        setUsages(foundUsages);
        setIsLoadingUsages(false);
      });
    } else {
      setUsages([]);
    }
  }, [context?.selectedImage]);

  const image = context?.selectedImage;
  const isOpen = !!image;

  const handleCopyUrl = () => {
    if (image?.url) {
      navigator.clipboard.writeText(image.url);
      toast({
        title: "URL Copied!",
        description: "The image URL has been copied to your clipboard.",
      });
    }
  };
  
  const handleSaveChanges = async () => {
    if (!image) return;
    setIsUpdating(true);
    
    const finalFilename = `${baseFilename}.${extension}`;
    
    const result = await updateImageDetailsAction({ id: image.id, altText, filename: finalFilename });
    setIsUpdating(false);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.success && result.updatedImage) {
      toast({ title: 'Success', description: 'Image details updated.' });
      context?.updateImage(result.updatedImage);
      context?.setSelectedImage(result.updatedImage);
    }
  };

  const handleDelete = async () => {
    if (!image) return;
    setIsDeleting(true);
    const result = await deleteImageAction({ id: image.id, filename: image.filename });
    setIsDeleting(false);

    if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive'});
    } else if (result.success) {
        toast({ title: 'Success', description: 'Image deleted successfully.' });
        context?.removeImage(image.id);
        context?.setSelectedImage(null);
    }
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseFilename(slugify(e.target.value));
  };

  const newFilename = `${baseFilename}.${extension}`;
  const isChanged = image ? (altText !== (image.altText || '')) || (newFilename !== image.filename) : false;
  
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && context?.setSelectedImage(null)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            Review, edit, and manage your uploaded image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                <ManagedImage src={image.url} alt={image.altText || image.filename} fill className="object-contain p-4"/>
            </div>
            <div className="space-y-4 flex flex-col">
                 <UsageDisplay usages={usages} isLoading={isLoadingUsages} />
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="imageUrl" value={image.url} readOnly />
                        <Button variant="outline" size="icon" onClick={handleCopyUrl} aria-label="Copy URL">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="filename">Filename</Label>
                    <div className="flex items-center">
                        <Input id="filename" value={baseFilename} onChange={handleFilenameChange} className="rounded-r-none focus:z-10" />
                        <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 rounded-r-md h-10">.{extension}</span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="altText">Alt Text</Label>
                    <Input id="altText" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Descriptive text for accessibility" />
                </div>
                 <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Size</p>
                        <p>{(image.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Uploaded On</p>
                        <p>{format(image.createdAt, "PPP")}</p>
                    </div>
                </div>
                <div className="flex-grow"></div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full mt-4" disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Image
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the image file from the server and it might break links on your site.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Yes, delete image
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
         <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={!isChanged || isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
