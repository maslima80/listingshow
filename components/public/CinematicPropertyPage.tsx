"use client";

import { useState, useRef } from "react";
import { HeroMedia } from "./HeroMedia";
import { HostCard } from "./HostCard";
import { VideoChapters } from "./VideoChapters";
import { CinematicPlayer } from "./CinematicPlayer";
import { Synopsis } from "./Synopsis";
import { PhotoGallery } from "./PhotoGallery";
import { EndCredits } from "./EndCredits";

interface Agent {
  id: string;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  isPrimary?: boolean;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
}

interface VideoChapter {
  id: string;
  title?: string | null;
  thumbnailUrl: string;
  playbackUrl: string;
  order: number;
}

interface Photo {
  id: string;
  url: string;
}

interface CinematicPropertyPageProps {
  // Hero
  heroPhoto: string;
  featuredVideo?: string | null;
  title: string;
  location: string;
  price: string;
  beds?: number | null;
  baths?: number | null;
  areaSqft?: string | null;
  
  // Host
  primaryAgent?: Agent;
  
  // Videos
  videoChapters: VideoChapter[];
  
  // Synopsis
  description?: string | null;
  highlights?: string[] | null;
  
  // Gallery
  photos: Photo[];
  
  // End Credits
  agents: Agent[];
  
  // Theme
  accentColor: string;
}

export function CinematicPropertyPage({
  heroPhoto,
  featuredVideo,
  title,
  location,
  price,
  beds,
  baths,
  areaSqft,
  primaryAgent,
  videoChapters,
  description,
  highlights,
  photos,
  agents,
  accentColor,
}: CinematicPropertyPageProps) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const contactRef = useRef<HTMLDivElement>(null);

  const handleWatchFilm = () => {
    setPlayerIndex(0);
    setPlayerOpen(true);
  };

  const handleChapterClick = (index: number) => {
    setPlayerIndex(index);
    setPlayerOpen(true);
  };

  const handleScheduleTour = () => {
    // Scroll to contact section
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out this property: ${title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <>
      {/* 1. Hero (Movie Poster) */}
      <HeroMedia
        heroPhoto={heroPhoto}
        featuredVideo={featuredVideo}
        title={title}
        location={location}
        price={price}
        beds={beds}
        baths={baths}
        areaSqft={areaSqft}
        onWatchFilm={handleWatchFilm}
        accentColor={accentColor}
      />

      {/* 2. Host (Agent Intro) */}
      {primaryAgent && (
        <HostCard
          name={primaryAgent.name}
          title={primaryAgent.title}
          photoUrl={primaryAgent.photoUrl}
          onScheduleTour={handleScheduleTour}
          accentColor={accentColor}
        />
      )}

      {/* 3. The Series (Video Chapters) */}
      {videoChapters.length > 0 && (
        <VideoChapters
          chapters={videoChapters}
          onChapterClick={handleChapterClick}
          accentColor={accentColor}
        />
      )}

      {/* 4. Full-Screen Player (Modal) */}
      <CinematicPlayer
        isOpen={playerOpen}
        chapters={videoChapters}
        initialIndex={playerIndex}
        onClose={() => setPlayerOpen(false)}
        propertyTitle={title}
        price={price}
        beds={beds}
        baths={baths}
        areaSqft={areaSqft}
        onScheduleTour={() => {
          setPlayerOpen(false);
          handleScheduleTour();
        }}
        accentColor={accentColor}
      />

      {/* 5. Synopsis (About + Highlights) */}
      <Synopsis
        description={description}
        highlights={highlights}
        accentColor={accentColor}
      />

      {/* 6. Gallery (Photos) */}
      <PhotoGallery photos={photos} />

      {/* 7. End Credits (Contact) */}
      <div ref={contactRef}>
        <EndCredits
          agents={agents}
          propertyTitle={title}
          accentColor={accentColor}
          onShare={handleShare}
        />
      </div>

      {/* Floating Schedule Tour Button (Mobile) */}
      {videoChapters.length > 0 && (
        <button
          onClick={handleScheduleTour}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white font-bold z-40 hover:scale-110 transition-transform"
          style={{ backgroundColor: accentColor }}
          aria-label="Schedule Tour"
        >
          📅
        </button>
      )}
    </>
  );
}
