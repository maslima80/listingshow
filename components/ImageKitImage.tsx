"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getImageKitUrl } from '@/lib/imagekit';

interface ImageKitImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ImageKitImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  className,
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover',
}: ImageKitImageProps) {
  const [error, setError] = useState(false);
  
  // If image failed to load or no src, show placeholder
  if (error || !src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }
  
  // Get optimized ImageKit URL
  const optimizedSrc = getImageKitUrl(src, {
    width,
    height,
    quality,
    format: 'auto', // Auto-select best format (WebP, AVIF, etc.)
    crop: 'maintain_ratio',
    focus: 'auto',
  });
  
  // Use Next.js Image component with ImageKit URL
  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        className={className}
        style={{ objectFit }}
        priority={priority}
        sizes={sizes}
        onError={() => setError(true)}
      />
    );
  }
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
