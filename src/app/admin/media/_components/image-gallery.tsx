
'use client';

import * as React from 'react';
import { type Image } from '@prisma/client';
import { ManagedImage } from '@/components/managed-image';
import { ImageDetailsDialog } from './image-details-dialog';
import { ImageGalleryContextProvider, ImageGalleryContext } from './image-gallery-context';

interface ImageGalleryProps {
    initialImages: Image[];
}

export function ImageGallery({ initialImages }: ImageGalleryProps) {

    return (
        <ImageGalleryContextProvider initialImages={initialImages}>
            <GalleryContent />
        </ImageGalleryContextProvider>
    );
}

function GalleryContent() {
    const context = React.useContext(ImageGalleryContext);
    
    if (!context) {
        return null;
    }
    
    const { images, setSelectedImage } = context;
    
    if (images.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                <p>No images have been uploaded yet.</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {images.map((image) => (
                    <button
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className="relative aspect-square block w-full rounded-lg overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                        aria-label={`View details for ${image.altText || image.filename}`}
                    >
                        <ManagedImage
                            src={image.url}
                            alt={image.altText || image.filename}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12.5vw"
                        />
                         <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>
            
            <ImageDetailsDialog />
        </>
    )
}
