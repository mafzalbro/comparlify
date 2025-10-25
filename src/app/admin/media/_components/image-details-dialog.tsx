
'use client';

import { type Image } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ManagedImage } from "@/components/managed-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ImageDetailsDialogProps {
  image: Image | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageDetailsDialog({ image, isOpen, onClose }: ImageDetailsDialogProps) {
  const { toast } = useToast();

  const handleCopyUrl = () => {
    if (image?.url) {
      navigator.clipboard.writeText(image.url);
      toast({
        title: "URL Copied!",
        description: "The image URL has been copied to your clipboard.",
      });
    }
  };
  
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            Review and copy the details for your uploaded image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                <ManagedImage src={image.url} alt={image.altText || image.filename} fill className="object-contain p-4"/>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="imageUrl" value={image.url} readOnly />
                        <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy URL</span>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">You can add Next.js Image component params like `?w=640&q=75` to this URL.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="filename">Filename</Label>
                    <Input id="filename" value={image.filename} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="altText">Alt Text</Label>
                    <Input id="altText" value={image.altText || ''} readOnly disabled />
                </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Size</p>
                        <p>{(image.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Uploaded On</p>
                        <p>{format(image.createdAt, "PPP")}</p>
                    </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
