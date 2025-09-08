'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ManagedImageProps extends ImageProps {
  fallback?: React.ReactNode;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function ManagedImage({
  src,
  alt,
  className,
  onError,
  fallback,
  width,
  height,
  ...props
}: ManagedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  if (hasError) {
    return (
       fallback || (
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground">
            <ImageOff className="h-10 w-10" />
            <p className="mt-2 text-xs">Image not available</p>
        </div>
        )
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      width={width}
      height={height}
      placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(Number(width) || 700, Number(height) || 475))}`}
      {...props}
    />
  );
}
