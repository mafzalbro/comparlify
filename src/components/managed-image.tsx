'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function ManagedImage(props: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [props.src]);

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const placeholderUrl = `https://placehold.co/${props.width ?? 400}x${props.height ?? 250}/e0e0e0/7f7f7f?text=Image+not+available`;

  return (
    <div className={cn("relative overflow-hidden", props.className)}>
        {isLoading && <Skeleton className="absolute inset-0" />}
        
        <Image
            {...props}
            src={hasError ? placeholderUrl : props.src}
            className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
                props.fill && "object-cover"
            )}
            onLoad={handleLoad}
            onError={handleError}
        />
    </div>
  );
}
