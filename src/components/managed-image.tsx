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
        className="flex items-center justify-center gap-2.5 bg-secondary/30 border border-border/40 rounded-xl px-4 py-2 text-center select-none min-h-[44px]"
        style={props.style}
        title={props.alt || 'Platform'}
      >
        {initial ? (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-sm tracking-wider shadow-xs shrink-0">
            {initial}
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Layers className="h-4 w-4" />
          </div>
        )}
        {props.alt && (
          <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight whitespace-nowrap">
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

    const fetchPriority = priority ? ("high" as const) : undefined;
    const loading = priority ? ("eager" as const) : ("lazy" as const);

    return (
      <img
        {...imgDomProps}
        src={props.src as string}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onError={() => {
          if (!error) {
            setError(true);
          }
        }}
        style={{
          width: !fill && width ? `${width}px` : undefined,
          height: !fill && height ? `${height}px` : undefined,
          ...fillStyle,
          ...(style as any),
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
