"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBathrooms } from "@/lib/utils/formatBathrooms";
import { HLSVideoPlayer } from "../HLSVideoPlayer";

interface HeroMediaProps {
  heroPhoto: string;
  featuredVideo?: string | null;
  isHeroVideo: boolean; // True if hero is a video, false if image
  firstVideoUrl?: string | null; // First video from gallery (if hero is image)
  title: string;
  location: string;
  price: string;
  beds?: number | null;
  baths?: number | null;
  areaSqft?: string | null;
  onWatchFilm: () => void;
  accentColor: string;
}

export function HeroMedia({
  heroPhoto,
  featuredVideo,
  isHeroVideo,
  firstVideoUrl,
  title,
  location,
  price,
  beds,
  baths,
  areaSqft,
  onWatchFilm,
  accentColor,
}: HeroMediaProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [hasPlayedPreview, setHasPlayedPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const autoplayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Determine which video to preview
  const previewVideoUrl = isHeroVideo ? featuredVideo : firstVideoUrl;
  const PREVIEW_DURATION = 5000; // 5 seconds
  const AUTOPLAY_DELAY = 2000; // 2 seconds after page load

  // Check for reduced motion/data preferences
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  const prefersReducedData = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-data: reduce)').matches
    : false;

  // Auto-preview logic: Play video preview once after delay
  useEffect(() => {
    // Skip if no video, already played, or user prefers reduced data
    if (!previewVideoUrl || hasPlayedPreview || prefersReducedData) return;

    // Start preview after delay
    autoplayTimerRef.current = setTimeout(() => {
      setShowVideo(true);
      setHasPlayedPreview(true);

      // Stop preview after PREVIEW_DURATION
      previewTimerRef.current = setTimeout(() => {
        setShowVideo(false);
      }, PREVIEW_DURATION);
    }, AUTOPLAY_DELAY);

    // Cleanup
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [previewVideoUrl, hasPlayedPreview, prefersReducedData]);

  // Pause video when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && showVideo) {
        // Stop preview if user switches tabs
        setShowVideo(false);
        if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [showVideo]);

  // Build inline facts string
  const facts = [
    beds ? `${beds} Bed${beds === 1 ? '' : 's'}` : null,
    baths ? formatBathrooms(baths) : null,
    areaSqft ? `${parseFloat(areaSqft).toLocaleString()} Sq Ft` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="relative w-full h-[100vh] sm:h-[85vh] md:h-[80vh] bg-black overflow-hidden">
      {/* Hero Photo - Always loads first */}
      <img
        src={heroPhoto}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          showVideo ? 'opacity-0' : 'opacity-100'
        }`}
        loading="eager"
        decoding="async"
      />

      {/* Video Preview - Fades in after delay, plays for 5 seconds, then fades out */}
      {previewVideoUrl && !prefersReducedData && (
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            showVideo ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: showVideo ? 2 : 1 }}
        >
          <iframe
            ref={iframeRef}
            src={`${previewVideoUrl}&muted=1`}
            className="w-full h-full object-cover"
            style={{ border: 'none', pointerEvents: 'none' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12">
        <div className="max-w-6xl mx-auto w-full space-y-4">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
            {title}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-5 h-5" />
            <span className="text-lg sm:text-xl">{location}</span>
          </div>

          {/* Price */}
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {price}
          </div>

          {/* Inline Facts */}
          {facts && (
            <div className="text-base sm:text-lg text-white/80">
              {facts}
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="text-white font-semibold text-base sm:text-lg px-8 py-6 rounded-full shadow-2xl hover:scale-105 transition-transform"
              style={{ backgroundColor: accentColor }}
              onClick={onWatchFilm}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Watch the Film
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
