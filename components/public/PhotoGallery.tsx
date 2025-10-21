"use client";

interface Photo {
  id: string;
  url: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <div className="py-8 sm:py-12 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Photo Gallery</h2>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
            >
              <img
                src={photo.url}
                alt="Property photo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Photo Count */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </div>
      </div>
    </div>
  );
}
