'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Layers } from 'lucide-react';

export function ManagedImage(props: ImageProps) {
  const [error, setError] = useState(false);

  const isExternal = typeof props.src === 'string' && props.src.startsWith('http');

  if (error || !props.src) {
    const isFill = !!props.fill;
    const fallbackStyle: React.CSSProperties = isFill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }
      : {
          width: props.width ? `${props.width}px` : '100%',
          height: props.height ? `${props.height}px` : '100%',
        };

    const initial = props.alt ? props.alt.trim().charAt(0).toUpperCase() : '';

    return (
      <div
        className="flex flex-col items-center justify-center bg-linear-to-br from-primary/10 via-background to-secondary/20 border border-border/40 rounded-xl p-2 text-center select-none overflow-hidden"
        style={{ ...fallbackStyle, ...props.style }}
        title={props.alt || 'Platform'}
      >
        {initial ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 text-primary font-black text-sm tracking-wider shadow-xs">
            {initial}
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
        )}
        {props.alt && !isFill && (
          <span className="text-[10px] font-bold text-muted-foreground mt-1.5 truncate max-w-[90%]">
            {props.alt}
          </span>
        )}
      </div>
    );
  }

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
        src={props.src as string}
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
      src={props.src}
      onError={() => {
        if (!error) { // Prevent infinite loop if fallback also fails
          setError(true);
        }
      }}
      unoptimized={error} // Use unoptimized for the SVG fallback
    />
  );
}
