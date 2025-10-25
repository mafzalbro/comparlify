
'use client';

import React, { createContext, useState, useCallback } from 'react';
import type { Image } from '@prisma/client';

interface ImageGalleryContextType {
  images: Image[];
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  addImage: (image: Image) => void;
  updateImage: (updatedImage: Image) => void;
  removeImage: (imageId: string) => void;
}

export const ImageGalleryContext = createContext<ImageGalleryContextType | null>(null);

export function ImageGalleryContextProvider({
  initialImages,
  children,
}: {
  initialImages: Image[];
  children: React.ReactNode;
}) {
  const [images, setImages] = useState<Image[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const addImage = useCallback((image: Image) => {
    setImages(prev => [image, ...prev]);
  }, []);

  const updateImage = useCallback((updatedImage: Image) => {
    setImages(prev => prev.map(img => img.id === updatedImage.id ? updatedImage : img));
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  return (
    <ImageGalleryContext.Provider value={{ images, selectedImage, setSelectedImage, addImage, updateImage, removeImage }}>
      {children}
    </ImageGalleryContext.Provider>
  );
}
