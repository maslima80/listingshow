import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { properties, mediaAssets, propertyAgents, agentProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Share2
} from "lucide-react";

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

  const heroMedia = media.find(m => m.id === property.coverAssetId) || media[0];

  return (
    <div className="min-h-screen bg-background">
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

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.beds && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bed className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{property.beds}</div>
                        <div className="text-sm text-muted-foreground">Beds</div>
                      </div>
                    </div>
                  )}
                  {property.baths && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bath className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{property.baths}</div>
                        <div className="text-sm text-muted-foreground">Baths</div>
                      </div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{property.parking}</div>
                        <div className="text-sm text-muted-foreground">Parking</div>
                      </div>
                    </div>
                  )}
                  {property.areaSqft && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Maximize className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {parseFloat(property.areaSqft).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Sq Ft</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Gallery */}
            {media.length > 1 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="aspect-video rounded-lg overflow-hidden">
                        {item.type === "video" ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt="Property"
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Button */}
            <Button variant="outline" className="w-full" size="lg">
              <Share2 className="w-5 h-5 mr-2" />
              Share Property
            </Button>

            {/* Agent Cards */}
            {propertyAgentsList.map(({ agent, isPrimary }) => (
              <Card key={agent.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {agent.photoUrl ? (
                      <img
                        src={agent.photoUrl}
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {agent.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      {agent.title && (
                        <p className="text-sm text-muted-foreground">{agent.title}</p>
                      )}
                      {isPrimary && (
                        <Badge variant="default" className="mt-1">Primary Agent</Badge>
                      )}
                    </div>
                  </div>
                  
                  {agent.bio && (
                    <p className="text-sm text-muted-foreground mb-4">{agent.bio}</p>
                  )}

                  <div className="space-y-2">
                    {agent.email && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    )}
                    {agent.phone && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    )}
                    {agent.whatsapp && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
