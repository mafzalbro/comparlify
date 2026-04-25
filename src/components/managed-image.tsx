
'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

export function ManagedImage(props: ImageProps) {
  const [error, setError] = useState(false);

  const fallbackSrc = `https://placehold.co/${props.width ?? 400}x${
    props.height ?? 250
  }/faf7f0/a1a1aa?text=Image+Not+Found`;

  const currentSrc = error ? fallbackSrc : props.src;

  const isExternal = typeof props.src === 'string' && props.src.startsWith('http');

  if (isExternal) {
    return (
      <img
        {...(props as any)}
        src={currentSrc as string}
        onError={() => {
          if (!error) {
            setError(true);
          }
        }}
        style={{
          width: props.width ? `${props.width}px` : 'auto',
          height: props.height ? `${props.height}px` : 'auto',
          ...props.style,
        }}
      />
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={() => {
        if (!error) { // Prevent infinite loop if fallback also fails
          setError(true);
        }
      }}
      unoptimized={error} // Use unoptimized for the SVG fallback
    />
  );
}
