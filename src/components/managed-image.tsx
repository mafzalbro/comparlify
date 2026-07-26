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
    const {
      fill,
      priority,
      quality,
      unoptimized,
      placeholder,
      blurDataURL,
      src,
      width,
      height,
      style,
      ...imgDomProps
    } = props;

    const fillStyle: React.CSSProperties = fill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: 'contain',
        }
      : {};

    return (
      <img
        {...imgDomProps}
        src={currentSrc as string}
        onError={() => {
          if (!error) {
            setError(true);
          }
        }}
        style={{
          width: !fill && width ? `${width}px` : undefined,
          height: !fill && height ? `${height}px` : undefined,
          ...fillStyle,
          ...style as any,
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
