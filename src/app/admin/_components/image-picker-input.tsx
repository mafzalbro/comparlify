
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ManagedImage } from '@/components/managed-image';
import type { Image } from '@prisma/client';

interface ImagePickerInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  images: Image[];
}

export function ImagePickerInput({ label, value, onValueChange, images }: ImagePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImageSelect = (imageUrl: string) => {
    onValueChange(imageUrl);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-2">
        <Input value={value} onChange={e => onValueChange(e.target.value)} required />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">Browse</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select an Image</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {images.map(image => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handleImageSelect(image.url)}
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
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
       {value && (
          <div className="mt-4 p-4 border rounded-md flex justify-center items-center bg-muted/50 h-32">
              <img src={value} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
      )}
    </div>
  );
}
