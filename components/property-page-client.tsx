"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bed, 
  Bath, 
  Car, 
  Maximize,
  Mail,
  Phone,
  MessageCircle,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Globe
} from "lucide-react";
import { VideoViewer } from "./video-viewer";
import { PhotoLightbox } from "./photo-lightbox";

interface MediaAsset {
  id: string;
  url: string;
  type: string;
  label: string | null;
}

interface Agent {
  id: string;
  name: string;
  title: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  isPrimary: boolean;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
}

interface PropertyPageClientProps {
  property: {
    title: string;
    price: string | null;
    location: string;
    beds: number | null;
    baths: number | null;
    parking: number | null;
    areaSqft: string | null;
    description: string | null;
    amenities: string[] | null;
  };
  media: MediaAsset[];
  agents: Agent[];
  accentColor: string;
}

export function PropertyPageClient({ property, media, agents, accentColor }: PropertyPageClientProps) {
  const [videoViewerOpen, setVideoViewerOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const videos = media.filter(m => m.type === "video");
  const photos = media.filter(m => m.type === "photo");

  const openVideoViewer = (index: number) => {
    setSelectedVideoIndex(index);
    setVideoViewerOpen(true);
  };

  const openPhotoLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoLightboxOpen(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} - $${parseFloat(property.price || "0").toLocaleString()}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Inquiry about ${property.title}&body=Hi, I'm interested in learning more about ${property.title} at ${property.location}.`;
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (whatsapp: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in ${property.title} at ${property.location}`);
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Quick Stats */}
        <Card className="mb-8 dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {property.beds && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <Bed className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{property.beds}</div>
                    <div className="text-sm text-muted-foreground">Beds</div>
                  </div>
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <Bath className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{property.baths}</div>
                    <div className="text-sm text-muted-foreground">Baths</div>
                  </div>
                </div>
              )}
              {property.parking && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <Car className="w-6 h-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{property.parking}</div>
                    <div className="text-sm text-muted-foreground">Parking</div>
                  </div>
                </div>
              )}
              {property.areaSqft && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <Maximize className="w-6 h-6" style={{ color: accentColor }} />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Videos Section - Instagram Reels Style */}
            {videos.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Property Tour</h2>
                <p className="text-muted-foreground text-sm">Tap any video to watch in fullscreen</p>
                
                {/* Vertical Video Grid - Instagram Reels Style */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {videos.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => openVideoViewer(index)}
                      className="group relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer bg-black shadow-lg hover:shadow-2xl transition-all"
                    >
                      {/* Video Preview */}
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      
                      {/* Gradient Overlay - Pure Cinematic */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 group-hover:from-black/60 transition-all">
                        {/* Video Title at Bottom */}
                        {video.label && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                            <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-lg">
                              {video.label}
                            </h3>
                          </div>
                        )}
                        
                        {/* Video Number Badge */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-xs font-medium">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-base py-2 px-4 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <Card className="dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        onClick={() => openPhotoLightbox(index)}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={photo.url}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
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
            <Button 
              className="w-full text-white" 
              size="lg"
              onClick={handleShare}
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Property
            </Button>

            {/* Agent Cards */}
            {agents.map((agent) => (
              <Card key={agent.id} className="overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="p-0">
                  {/* Agent Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start gap-4">
                      {agent.photoUrl ? (
                        <img
                          src={agent.photoUrl}
                          alt={agent.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                          <span className="text-xl font-bold text-primary">
                            {agent.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight">{agent.name}</h3>
                        {agent.title && (
                          <p className="text-sm text-muted-foreground mt-0.5">{agent.title}</p>
                        )}
                        
                        {/* Social Links */}
                        {(agent.instagram || agent.facebook || agent.linkedin || agent.twitter || agent.website) && (
                          <div className="flex gap-2 mt-2">
                            {agent.instagram && (
                              <a
                                href={agent.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                style={{ backgroundColor: accentColor }}
                              >
                                <Instagram className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {agent.facebook && (
                              <a
                                href={agent.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                style={{ backgroundColor: accentColor }}
                              >
                                <Facebook className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {agent.linkedin && (
                              <a
                                href={agent.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                style={{ backgroundColor: accentColor }}
                              >
                                <Linkedin className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {agent.twitter && (
                              <a
                                href={agent.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                style={{ backgroundColor: accentColor }}
                              >
                                <Twitter className="w-4 h-4 text-white" />
                              </a>
                            )}
                            {agent.website && (
                              <a
                                href={agent.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                style={{ backgroundColor: accentColor }}
                              >
                                <Globe className="w-4 h-4 text-white" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {agent.bio && (
                      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                        {agent.bio}
                      </p>
                    )}
                  </div>

                  {/* Contact Actions */}
                  <div className="border-t bg-muted/30 dark:bg-zinc-800/50 dark:border-zinc-700 p-3 space-y-2">
                    {agent.email && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-background dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 hover:text-white transition-colors" 
                        size="sm"
                        onClick={() => handleEmail(agent.email!)}
                        style={{ 
                          ['--hover-bg' as string]: accentColor 
                        } as React.CSSProperties}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    )}
                    {agent.phone && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-background dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 hover:text-white transition-colors" 
                        size="sm"
                        onClick={() => handleCall(agent.phone!)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    )}
                    {agent.whatsapp && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-background dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 hover:bg-emerald-600 hover:text-white transition-colors" 
                        size="sm"
                        onClick={() => handleWhatsApp(agent.whatsapp!)}
                      >
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

      {/* Video Viewer Modal */}
      {videoViewerOpen && (
        <VideoViewer
          videos={videos.map(v => ({ id: v.id, url: v.url, title: v.label }))}
          initialIndex={selectedVideoIndex}
          onClose={() => setVideoViewerOpen(false)}
        />
      )}

      {/* Photo Lightbox Modal */}
      {photoLightboxOpen && (
        <PhotoLightbox
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setPhotoLightboxOpen(false)}
        />
      )}
    </>
  );
}
