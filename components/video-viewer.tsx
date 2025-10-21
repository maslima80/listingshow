"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HLSVideoPlayer } from "./HLSVideoPlayer";

interface Video {
  id: string;
  url: string;
  title?: string | null;
}

interface VideoViewerProps {
  videos: Video[];
  initialIndex: number;
  onClose: () => void;
}

export function VideoViewer({ videos, initialIndex, onClose }: VideoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const currentVideo = videos[currentIndex];
  const hasNext = currentIndex < videos.length - 1;
  const hasPrev = currentIndex > 0;

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [currentIndex]);

  const goToNext = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (hasPrev) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && hasNext) {
        // Swiped up - next video
        goToNext();
      } else if (swipeDistance < 0 && hasPrev) {
        // Swiped down - previous video
        goToPrev();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex-1">
            {currentVideo.title && (
              <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
            )}
            <p className="text-sm text-white/80">
              {currentIndex + 1} of {videos.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center relative">
        <HLSVideoPlayer
          src={currentVideo.url}
          className="w-full h-full object-contain max-h-screen"
          controls
          autoPlay
          playsInline
          controlsList="nodownload"
        />

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 pointer-events-none">
          {hasPrev && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPrev}
              className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div className="flex-1" />
          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              onClick={goToNext}
              className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Swipe Indicator (Mobile) */}
      <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-4">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 max-w-12 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Mobile Navigation Hint */}
      {videos.length > 1 && (
        <div className="md:hidden absolute bottom-12 left-0 right-0 text-center text-white/60 text-sm pb-2">
          Swipe {hasNext ? "up" : ""}{hasNext && hasPrev ? " or " : ""}{hasPrev ? "down" : ""} for {hasNext && hasPrev ? "more" : hasNext ? "next" : "previous"}
        </div>
      )}
    </div>
  );
}
