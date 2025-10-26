
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ManagedImage } from '@/components/managed-image';
import type { Image } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { getImagesAction } from '@/app/actions/media';
import { ImageIcon } from 'lucide-react';

interface ImagePickerInputProps {
  label: string;
  name: string;
  defaultValue?: string;
}

function ImageGrid({ onImageSelect }: { onImageSelect: (url: string) => void }) {
    const [images, setImages] = useState<Image[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getImagesAction().then((fetchedImages) => {
            setImages(fetchedImages);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <ImageGridSkeleton />;
    }

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-12">
                <ImageIcon className="h-12 w-12 mb-4" />
                <h3 className="font-semibold">No Images in Gallery</h3>
                <p className="text-sm">Upload an image to get started.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
        {images.map(image => (
          <button
            key={image.id}
            type="button"
            onClick={() => onImageSelect(image.url)}
            className="block w-full aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all group"
          >
            <ManagedImage
              src={image.url}
              alt={image.altText || image.filename}
              width={200}
              height={200}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    )
}

function ImageGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded-lg" />
            ))}
        </div>
    )
}

export function ImagePickerInput({ label, name, defaultValue = '' }: ImagePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(defaultValue);

  const handleImageSelect = (imageUrl: string) => {
    setCurrentValue(imageUrl);
    setIsOpen(false);
  };
  
  // Update internal state if the defaultValue prop changes from the outside
  useEffect(() => {
    setCurrentValue(defaultValue);
  }, [defaultValue])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-2">
        <Input name={name} value={currentValue} onChange={e => setCurrentValue(e.target.value)} required />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">Browse</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select an Image</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-full">
                <Suspense fallback={<ImageGridSkeleton />}>
                    <ImageGrid onImageSelect={handleImageSelect} />
                </Suspense>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
       {currentValue && (
          <div className="mt-4 p-4 border rounded-md flex justify-center items-center bg-muted/50 h-32">
              <img src={currentValue} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
      )}
    </div>
  );
}
