
'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

export function ManagedImage(props: ImageProps) {
  const [error, setError] = useState(false);

  const fallbackSrc = `https://placehold.co/${props.width ?? 400}x${
    props.height ?? 250
  }/faf7f0/a1a1aa?text=Image+Not+Found`;

  const currentSrc = error ? fallbackSrc : props.src;

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
