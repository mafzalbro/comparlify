
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
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-4 space-y-4">
                {images.map((image) => (
                    <button
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className="block w-full rounded-lg overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all group"
                        aria-label={`View details for ${image.altText || image.filename}`}
                    >
                        <ManagedImage
                            src={image.url}
                            alt={image.altText || image.filename}
                            width={500}
                            height={500}
                            className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        />
                    </button>
                ))}
            </div>
            
            <ImageDetailsDialog />
        </>
    )
}
