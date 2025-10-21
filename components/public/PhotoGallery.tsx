"use client";

import { useState } from "react";
import { PremiumPhotoLightbox } from "./PremiumPhotoLightbox";

interface Photo {
  id: string;
  url: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (photos.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Photo Gallery</h2>
            <p className="text-muted-foreground text-sm mt-1">Click any photo to view full size</p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer relative"
              >
                <img
                  src={photo.url}
                  alt="Property photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                    View Full Size
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo Count */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>
      </div>

      {/* Premium Photo Lightbox */}
      {lightboxOpen && (
        <PremiumPhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
