'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

interface ManagedImageProps extends ImageProps {
  fallback?: React.ReactNode;
}

export function ManagedImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  fallback,
  ...props
}: ManagedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {(isLoading || hasError) && (
        <div className="absolute inset-0">
            {isLoading && !hasError && <Skeleton className="h-full w-full" />}
            {hasError && (
                fallback || (
                <div className="flex h-full w-full flex-col items-center justify-center bg-muted text-muted-foreground">
                    <ImageOff className="h-10 w-10" />
                    <p className="mt-2 text-xs">Image not available</p>
                </div>
                )
            )}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading || hasError ? 'opacity-0' : 'opacity-100',
           // Pass the original className to the Image component itself for layout purposes
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}