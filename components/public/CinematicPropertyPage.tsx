"use client";

import { useState, useRef, useEffect } from "react";
import { HeroMedia } from "./HeroMedia";
import { HostCard } from "./HostCard";
import { VideoChapters } from "./VideoChapters";
import { KeyFacts } from "./KeyFacts";
import { CinematicPlayer } from "./CinematicPlayer";
import { Synopsis } from "./Synopsis";
import { PhotoGallery } from "./PhotoGallery";
import { EndCredits } from "./EndCredits";
import { ScheduleTourModal } from "./ScheduleTourModal";
import { Toaster } from "@/components/ui/toaster";

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
  // Property ID
  propertyId: string;
  
  // Hero
  heroPhoto: string;
  featuredVideo?: string | null;
  isHeroVideo: boolean;
  firstVideoUrl?: string | null;
  title: string;
  location: string;
  price: string;
  listingPurpose?: 'sale' | 'rent' | 'coming_soon';
  propertyType?: string | null;
  beds?: number | null;
  baths?: number | null;
  areaSqft?: string | null;
  yearBuilt?: number | null;
  hoaDues?: string | null;
  hoaPeriod?: string | null;
  
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
  externalLinks?: { label: string; url: string; }[] | null;
  
  // Theme
  accentColor: string;
}

export function CinematicPropertyPage({
  propertyId,
  heroPhoto,
  featuredVideo,
  isHeroVideo,
  firstVideoUrl,
  title,
  location,
  price,
  listingPurpose,
  propertyType,
  beds,
  baths,
  areaSqft,
  yearBuilt,
  hoaDues,
  hoaPeriod,
  primaryAgent,
  videoChapters,
  description,
  highlights,
  photos,
  agents,
  externalLinks,
  accentColor,
}: CinematicPropertyPageProps) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [scheduleTourOpen, setScheduleTourOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleWatchFilm = () => {
    // If hero is a video, find its index in videoChapters and start from there
    if (isHeroVideo && featuredVideo) {
      const heroVideoIndex = videoChapters.findIndex(v => v.playbackUrl === featuredVideo);
      setPlayerIndex(heroVideoIndex >= 0 ? heroVideoIndex : 0);
    } else {
      // Otherwise start from first video
      setPlayerIndex(0);
    }
    setPlayerOpen(true);
  };

  const handleChapterClick = (index: number) => {
    setPlayerIndex(index);
    setPlayerOpen(true);
  };

  const handleScheduleTour = () => {
    // Open schedule tour modal
    setScheduleTourOpen(true);
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

  // Show floating button after scrolling past hero + host sections
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling ~120vh (hero + host section)
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight * 1.2; // 120vh
      
      setShowFloatingButton(scrollPosition > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 1. Hero (Movie Poster) */}
      <HeroMedia
        heroPhoto={heroPhoto}
        featuredVideo={featuredVideo}
        isHeroVideo={isHeroVideo}
        firstVideoUrl={firstVideoUrl}
        title={title}
        location={location}
        price={price}
        listingPurpose={listingPurpose}
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
          bio={primaryAgent.bio}
          email={primaryAgent.email}
          phone={primaryAgent.phone}
          whatsapp={primaryAgent.phone} // Use phone as WhatsApp if available
          instagram={primaryAgent.instagram}
          facebook={primaryAgent.facebook}
          linkedin={primaryAgent.linkedin}
          website={primaryAgent.website}
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

      {/* 7. Key Facts */}
      <KeyFacts
        listingPurpose={listingPurpose}
        propertyType={propertyType}
        beds={beds}
        baths={baths}
        areaSqft={areaSqft}
        price={price}
        yearBuilt={yearBuilt}
        hoaDues={hoaDues}
        hoaPeriod={hoaPeriod}
        location={location}
      />

      {/* 8. End Credits (Contact) */}
      <div ref={contactRef}>
        <EndCredits
          propertyId={propertyId}
          agents={agents}
          propertyTitle={title}
          accentColor={accentColor}
          externalLinks={externalLinks || []}
          onShare={handleShare}
          onContactClick={handleScheduleTour}
        />
      </div>

      {/* Floating Contact Button (Mobile) - Opens Schedule Tour Modal */}
      {videoChapters.length > 0 && showFloatingButton && (
        <button
          onClick={handleScheduleTour}
          className="fixed bottom-6 right-6 lg:hidden px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-white font-semibold text-sm z-40 hover:scale-105 transition-all animate-in slide-in-from-bottom duration-300"
          style={{ backgroundColor: accentColor }}
          aria-label="Schedule Tour"
        >
          <span>📅</span>
          <span>Schedule Tour</span>
        </button>
      )}

      {/* Schedule Tour Modal */}
      <ScheduleTourModal
        open={scheduleTourOpen}
        onOpenChange={setScheduleTourOpen}
        propertyId={propertyId}
        propertyTitle={title}
        source="schedule_tour_cta"
        type="tour_request"
      />

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
