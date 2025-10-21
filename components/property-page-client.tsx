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
      {/* Floating Stats Card - Glassmorphism */}
      <div className="relative -mt-6 sm:-mt-8 mb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div 
            className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-800/50 p-4 sm:p-6"
            style={{
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {property.beds && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Bed className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold leading-none">{property.beds}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Beds</div>
                  </div>
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Bath className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold leading-none">{property.baths}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Baths</div>
                  </div>
                </div>
              )}
              {property.parking && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Car className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold leading-none">{property.parking}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Parking</div>
                  </div>
                </div>
              )}
              {property.areaSqft && (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Maximize className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-bold leading-none">
                      {parseFloat(property.areaSqft).toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Sq Ft</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Videos Section - Netflix Style */}
            {videos.length > 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Property Tour</h2>
                  <p className="text-muted-foreground text-sm">Swipe through highlights or browse all videos below</p>
                </div>
                
                {/* Horizontal Swipe Carousel - Instagram Stories Style */}
                <div className="relative -mx-4 sm:mx-0">
                  <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                    <div className="flex gap-3 px-4 sm:px-0 pb-4">
                      {videos.map((video, index) => (
                        <div
                          key={video.id}
                          onClick={() => openVideoViewer(index)}
                          className="flex-none w-[45vw] sm:w-[200px] snap-center group cursor-pointer"
                        >
                          {/* Vertical Video Card */}
                          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-xl hover:shadow-2xl transition-all">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 group-hover:from-black/50 transition-all" />
                            
                            {/* Duration Badge */}
                            <div className="absolute top-3 right-3">
                              <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium">
                                0:45
                              </div>
                            </div>
                            
                            {/* Play Indicator on Hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                              </div>
                            </div>
                            
                            {/* Video Title Inside Card */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow-lg">
                                {video.label || `Video ${index + 1}`}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Swipe Indicator */}
                  <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground text-sm sm:hidden">
                    <span>←</span>
                    <span>Swipe</span>
                    <span>→</span>
                  </div>
                </div>
                
                {/* Full Video Tour - 3 Column Grid */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Full Video Tour</h3>
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
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 group-hover:from-black/60 transition-all">
                          {/* Video Title at Bottom */}
                          {video.label && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                              <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-lg">
                                {video.label}
                              </h3>
                            </div>
                          )}
                          
                          {/* Duration Badge */}
                          <div className="absolute top-2 right-2">
                            <div className="bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-white text-xs font-medium">
                              0:45
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
