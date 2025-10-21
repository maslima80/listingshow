"use client";

import { Play } from "lucide-react";

interface VideoChapter {
  id: string;
  title?: string | null;
  thumbnailUrl: string;
  playbackUrl: string;
  order: number;
}

interface VideoChaptersProps {
  chapters: VideoChapter[];
  onChapterClick: (index: number) => void;
  accentColor: string;
}

export function VideoChapters({ chapters, onChapterClick, accentColor }: VideoChaptersProps) {
  // Sort by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Generate fallback titles
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  
  return (
    <div className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">The Series</h2>
          <p className="text-muted-foreground">Tap any chapter to watch</p>
        </div>

        {/* Horizontal Carousel - Vertical Cards */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-3 px-4 sm:px-0 pb-4">
              {sortedChapters.map((chapter, index) => {
                const displayTitle = chapter.title || `Part ${romanNumerals[index] || index + 1}`;
                
                return (
                  <div
                    key={chapter.id}
                    onClick={() => onChapterClick(index)}
                    className="flex-none w-[42vw] sm:w-[220px] snap-center group cursor-pointer"
                  >
                    {/* Cinematic Poster Card (2:3 ratio) */}
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-black shadow-xl hover:shadow-2xl transition-all">
                      {/* Thumbnail */}
                      <img
                        src={chapter.thumbnailUrl}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 group-hover:from-black/60 transition-all" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm"
                          style={{ backgroundColor: `${accentColor}90` }}
                        >
                          <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </div>
                      </div>

                      {/* Chapter Number Badge */}
                      <div className="absolute top-3 left-3">
                        <div 
                          className="px-3 py-1 rounded-full text-white text-sm font-semibold backdrop-blur-sm"
                          style={{ backgroundColor: `${accentColor}80` }}
                        >
                          {romanNumerals[index] || index + 1}
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium">
                          0:45
                        </div>
                      </div>

                      {/* Title Inside Card at Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow-lg">
                          {displayTitle}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Indicator (Mobile) */}
          {sortedChapters.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground text-sm sm:hidden">
              <span>←</span>
              <span>Swipe</span>
              <span>→</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
