'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Sparkles } from 'lucide-react';

export function ManagedImage(props: ImageProps) {
  const [error, setError] = useState(false);

  const isExternal = typeof props.src === 'string' && props.src.startsWith('http');

  if (error) {
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
          height: props.height ? `${props.height}px` : '250px',
        };

    return (
      <div
        className="flex flex-col items-center justify-center bg-accent-surface dark:bg-white/5 border border-border/30 rounded-2xl p-4 text-center select-none"
        style={{ ...fallbackStyle, ...props.style }}
      >
        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/25 text-primary mb-2">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
          Comparlify Premium
        </span>
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
