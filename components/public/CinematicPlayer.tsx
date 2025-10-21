"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Info, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBathrooms } from "@/lib/utils/formatBathrooms";

interface VideoChapter {
  id: string;
  title?: string | null;
  playbackUrl: string;
  order: number;
}

interface CinematicPlayerProps {
  isOpen: boolean;
  chapters: VideoChapter[];
  initialIndex: number;
  onClose: () => void;
  propertyTitle: string;
  price: string;
  beds?: number | null;
  baths?: number | null;
  areaSqft?: string | null;
  onScheduleTour: () => void;
  accentColor: string;
}

export function CinematicPlayer({
  isOpen,
  chapters,
  initialIndex,
  onClose,
  propertyTitle,
  price,
  beds,
  baths,
  areaSqft,
  onScheduleTour,
  accentColor,
}: CinematicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Sort chapters
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const currentChapter = sortedChapters[currentIndex];
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const displayTitle = currentChapter?.title || `Part ${romanNumerals[currentIndex] || currentIndex + 1}`;

  // Update index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;

    if (isSwipeUp && currentIndex < sortedChapters.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isSwipeDown && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < sortedChapters.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, sortedChapters.length, onClose]);

  // Auto-play current video
  useEffect(() => {
    if (isOpen && videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.play().catch(() => {});
    }
  }, [isOpen, currentIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Container */}
      <div
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render 3-item buffer (prev, current, next) */}
        {sortedChapters.map((chapter, index) => {
          const isVisible = Math.abs(index - currentIndex) <= 1;
          if (!isVisible) return null;

          return (
            <video
              key={chapter.id}
              ref={el => { videoRefs.current[index] = el; }}
              src={chapter.playbackUrl}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              loop
              playsInline
              controls={false}
            />
          );
        })}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">
              {currentIndex + 1} / {sortedChapters.length}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="text-sm opacity-80">Now Playing</div>
              <div className="font-semibold text-lg">{displayTitle}</div>
            </div>

            {/* Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Info Sheet */}
        {showInfo && (
          <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl p-6 rounded-t-3xl z-20 animate-in slide-in-from-bottom">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-xl font-bold">{propertyTitle}</h3>
              <div className="text-2xl font-bold" style={{ color: accentColor }}>
                {price}
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 text-sm">
                {beds && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{beds} Bed{beds === 1 ? '' : 's'}</span>
                  </div>
                )}
                {baths && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{formatBathrooms(baths)}</span>
                  </div>
                )}
                {areaSqft && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{parseFloat(areaSqft).toLocaleString()} SF</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button
                className="w-full text-white"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                  setShowInfo(false);
                  onScheduleTour();
                }}
              >
                Schedule Tour
              </Button>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full text-center text-sm text-muted-foreground py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
