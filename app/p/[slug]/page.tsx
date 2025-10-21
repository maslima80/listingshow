import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents, agentProfiles, teamThemes, themes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CinematicPropertyPage } from "@/components/public/CinematicPropertyPage";

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params (Next.js 15 requirement)
  const { slug } = await params;

  // Get property
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, slug))
    .limit(1);

  if (!property) {
    notFound();
  }

  // Get media
  const media = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.propertyId, property.id))
    .orderBy(mediaAssets.position);

  // Get agents
  const propertyAgentsList = await db
    .select({
      agent: agentProfiles,
      isPrimary: propertyAgents.isPrimary,
    })
    .from(propertyAgents)
    .innerJoin(agentProfiles, eq(propertyAgents.agentProfileId, agentProfiles.id))
    .where(eq(propertyAgents.propertyId, property.id));

  // Get team theme with accent color and mode
  const [teamThemeData] = await db
    .select({
      accentColor: teamThemes.accentColor,
      themeMode: themes.mode,
    })
    .from(teamThemes)
    .innerJoin(themes, eq(teamThemes.themeId, themes.id))
    .where(eq(teamThemes.teamId, property.teamId))
    .limit(1);

  const accentColor = teamThemeData?.accentColor || '#C9A66B';
  const themeMode = teamThemeData?.themeMode || 'light';

  // Separate media types
  const videos = media.filter(m => m.type === "video");
  const photos = media.filter(m => m.type === "photo");

  // Find hero media (coverAssetId or first photo/video)
  const heroMedia = media.find(m => m.id === property.coverAssetId) 
    || photos[0] 
    || videos[0]
    || media[0];

  // Determine if hero is a video
  const isHeroVideo = heroMedia?.type === "video";

  // Get hero video URL (if hero is video)
  const heroVideoUrl = isHeroVideo ? heroMedia?.url : null;

  // Get first video URL (for preview if hero is image)
  const firstVideo = videos[0];
  const firstVideoUrl = firstVideo?.url || null;

  // Format agents data
  const formattedAgents = propertyAgentsList.map(({ agent, isPrimary }) => {
    const socialLinks = agent.socialLinks as { 
      instagram?: string; 
      facebook?: string; 
      linkedin?: string; 
      twitter?: string; 
      website?: string 
    } | null;
    
    return {
      id: agent.id,
      name: agent.name,
      title: agent.title,
      photoUrl: agent.photoUrl,
      email: agent.email,
      phone: agent.phone,
      bio: agent.bio,
      isPrimary,
      instagram: socialLinks?.instagram || null,
      facebook: socialLinks?.facebook || null,
      linkedin: socialLinks?.linkedin || null,
      twitter: socialLinks?.twitter || null,
      website: socialLinks?.website || null,
    };
  });

  // Format video chapters
  const videoChapters = videos.map((video, index) => ({
    id: video.id,
    title: video.label,
    thumbnailUrl: video.thumbUrl || video.url, // Use Bunny.net thumbnail
    playbackUrl: video.url,
    order: video.position || index,
    durationSec: video.durationSec,
  }));

  // Format photos
  const photoGallery = photos.map(photo => ({
    id: photo.id,
    url: photo.url,
  }));

  // Primary agent for host card
  const primaryAgent = formattedAgents.find(a => a.isPrimary) || formattedAgents[0];

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark' : ''}`}>
      <CinematicPropertyPage
        // Hero
        heroPhoto={(heroMedia?.type === 'video' ? heroMedia?.thumbUrl : heroMedia?.url) || ''}
        featuredVideo={heroVideoUrl}
        isHeroVideo={isHeroVideo}
        firstVideoUrl={firstVideoUrl}
        title={property.title}
        location={property.location}
        price={`$${parseFloat(property.price || "0").toLocaleString()}`}
        beds={property.beds}
        baths={property.baths ? parseFloat(property.baths as string) : null}
        areaSqft={property.areaSqft}
        
        // Host
        primaryAgent={primaryAgent}
        
        // Videos
        videoChapters={videoChapters}
        
        // Synopsis
        description={property.description}
        highlights={property.amenities}
        
        // Gallery
        photos={photoGallery}
        
        // End Credits
        agents={formattedAgents}
        externalLinks={property.externalLinks as { label: string; url: string; }[] | null}
        
        // Theme
        accentColor={accentColor}
      />
    </div>
  );
}
