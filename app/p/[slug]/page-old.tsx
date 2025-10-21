import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents, agentProfiles, teamThemes, themes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MapPin } from "lucide-react";
import { PropertyPageClient } from "@/components/property-page-client";

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  // Get property
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, params.slug))
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

  const heroMedia = media.find(m => m.id === property.coverAssetId) || media[0];

  // Format agents data
  const formattedAgents = propertyAgentsList.map(({ agent, isPrimary }) => {
    const socialLinks = agent.socialLinks as { instagram?: string; facebook?: string; linkedin?: string; twitter?: string; website?: string } | null;
    
    return {
      id: agent.id,
      name: agent.name,
      title: agent.title,
      photoUrl: agent.photoUrl,
      email: agent.email,
      phone: agent.phone,
      whatsapp: agent.whatsapp,
      bio: agent.bio,
      isPrimary,
      instagram: socialLinks?.instagram || null,
      facebook: socialLinks?.facebook || null,
      linkedin: socialLinks?.linkedin || null,
      twitter: socialLinks?.twitter || null,
      website: socialLinks?.website || null,
    };
  });

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      {/* Hero Section */}
      <div className="relative h-[70vh] bg-black">
        {heroMedia && (
          <>
            {heroMedia.type === "video" ? (
              <video
                src={heroMedia.url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={heroMedia.url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}
        
        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-lg mb-4">
              <MapPin className="w-5 h-5" />
              <span>{property.location}</span>
            </div>
            <div className="text-3xl font-bold">
              ${parseFloat(property.price || "0").toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Client-side Interactive Content */}
      <PropertyPageClient
        property={{
          title: property.title,
          price: property.price,
          location: property.location,
          beds: property.beds,
          baths: property.baths,
          parking: property.parking,
          areaSqft: property.areaSqft,
          description: property.description,
          amenities: property.amenities,
        }}
        media={media}
        agents={formattedAgents}
        accentColor={accentColor}
      />
    </div>
  );
}
