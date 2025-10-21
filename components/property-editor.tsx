"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VideoThumbnailSelector } from "@/components/video-thumbnail-selector";
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Star,
  Home,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Sparkles,
  Check,
  Loader2,
  X,
  Save,
  Globe
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
}

interface ExistingMedia {
  id: string;
  url: string;
  thumbUrl?: string;
  type: "video" | "photo";
  isHero: boolean;
  title?: string;
  providerId?: string;
}

interface PropertyEditorProps {
  propertyId: string;
  teamId: string;
  userId: string;
  initialData: {
    name: string;
    price: string;
    location: string;
    showFullAddress: boolean;
    beds: string;
    baths: string;
    parking: string;
    sqft: string;
    description: string;
    amenities: string[];
    externalLinks: { label: string; url: string; }[];
    agentIds: string[];
  };
  existingMedia: ExistingMedia[];
  agents: Agent[];
}

interface MediaFile {
  id: string;
  file?: File;
  url: string;
  preview: string;
  thumbUrl?: string;
  type: "video" | "photo";
  isHero: boolean;
  title?: string;
  isExisting: boolean;
  providerId?: string;
}

const AMENITY_TAGS = [
  "Ocean View",
  "Pool",
  "Beach Access",
  "Waterfront",
  "Mountain View",
  "City View",
  "Sunset View",
  "Garden",
  "Tennis Court",
  "Gym",
  "Spa",
  "Wine Cellar",
  "Theater Room",
  "Game Room",
  "Gourmet Kitchen",
  "Smart Home",
  "Fireplace",
  "Garage",
  "Elevator",
  "Concierge",
];

export function PropertyEditor({ 
  propertyId,
  teamId, 
  userId, 
  initialData,
  existingMedia,
  agents 
}: PropertyEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Convert existing media to MediaFile format
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
    existingMedia.map(m => ({
      id: m.id,
      url: m.url,
      preview: m.thumbUrl || m.url, // Use thumbnail for videos
      thumbUrl: m.thumbUrl,
      type: m.type,
      isHero: m.isHero,
      title: m.title,
      isExisting: true,
      providerId: m.providerId,
    }))
  );
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData.amenities);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(initialData.agentIds);
  const [customAmenity, setCustomAmenity] = useState("");
  const [externalLinks, setExternalLinks] = useState<{ label: string; url: string; }[]>(initialData.externalLinks || []);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  
  const [formData, setFormData] = useState(initialData);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const hasExistingHero = mediaFiles.some(m => m.isHero);
    
    const newMediaFiles = files.map((file, index) => {
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      
      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: "",
        preview,
        type: isVideo ? "video" : "photo",
        isHero: !hasExistingHero && index === 0,
        isExisting: false,
      };
      
      return mediaFile;
    });
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const setAsHero = (id: string) => {
    setMediaFiles(prev => 
      prev.map(media => ({
        ...media,
        isHero: media.id === id,
      }))
    );
  };

  const removeMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(m => m.id !== id));
    if (mediaFiles.find(m => m.id === id)?.isHero) {
      // If removing hero, set first remaining media as hero
      const remaining = mediaFiles.filter(m => m.id !== id);
      if (remaining.length > 0) {
        setMediaFiles(prev => prev.map(m => 
          m.id === remaining[0].id ? { ...m, isHero: true } : m
        ));
      }
    }
  };

  const handleThumbnailChange = (mediaId: string, newThumbnailUrl: string) => {
    setMediaFiles(prev => prev.map(m => 
      m.id === mediaId ? { ...m, thumbUrl: newThumbnailUrl, preview: newThumbnailUrl } : m
    ));
  };

  const updateMediaTitle = (id: string, title: string) => {
    setMediaFiles(prev =>
      prev.map(media =>
        media.id === id ? { ...media, title } : media
      )
    );
  };

  // Drag and drop handlers
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, mediaId: string) => {
    setDraggedItem(mediaId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    setMediaFiles(prev => {
      const videos = prev.filter(m => m.type === "video");
      const photos = prev.filter(m => m.type === "photo");
      
      const draggedIndex = videos.findIndex(m => m.id === draggedItem);
      const targetIndex = videos.findIndex(m => m.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const reorderedVideos = [...videos];
      const [removed] = reorderedVideos.splice(draggedIndex, 1);
      reorderedVideos.splice(targetIndex, 0, removed);
      
      return [...reorderedVideos, ...photos];
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || mediaFiles.length === 0) {
      alert("Please add property name, price, and at least one photo/video");
      return;
    }

    setIsSaving(true);
    
    try {
      const data = new FormData();
      
      // Add property details
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("location", formData.location);
      data.append("showFullAddress", formData.showFullAddress.toString());
      data.append("beds", formData.beds);
      data.append("baths", formData.baths);
      data.append("parking", formData.parking);
      data.append("sqft", formData.sqft);
      data.append("description", formData.description);
      data.append("amenities", JSON.stringify(selectedAmenities));
      data.append("agentIds", JSON.stringify(selectedAgents));
      data.append("externalLinks", JSON.stringify(externalLinks));
      
      // Add hero media ID
      const heroMedia = mediaFiles.find(m => m.isHero);
      if (heroMedia) {
        data.append("heroMediaId", heroMedia.id);
      }
      
      // Add existing media IDs and titles to keep
      const existingMediaIds = mediaFiles
        .filter(m => m.isExisting)
        .map(m => m.id);
      data.append("existingMediaIds", JSON.stringify(existingMediaIds));
      
      // Add existing media titles
      const existingMediaTitles = mediaFiles
        .filter(m => m.isExisting && m.title)
        .map(m => ({ id: m.id, title: m.title }));
      data.append("existingMediaTitles", JSON.stringify(existingMediaTitles));
      
      // Add new media files
      const newMedia = mediaFiles.filter(m => !m.isExisting && m.file);
      newMedia.forEach((media, index) => {
        if (media.file) {
          data.append("media", media.file);
          data.append(`mediaId_${index}`, media.id);
          if (media.title) {
            data.append(`mediaTitle_${index}`, media.title);
          }
        }
      });
      
      // Update property
      const response = await fetch(`/api/properties/${propertyId}/update`, {
        method: "PUT",
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }
      
      // Redirect back to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to save property:", error);
      alert(error instanceof Error ? error.message : "Failed to save property. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Media Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Media
          </CardTitle>
          <CardDescription>
            Upload photos and videos. Videos are mobile-first and will be featured prominently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Button */}
          <div>
            <input
              type="file"
              id="media-upload"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              className="hidden"
            />
            <label htmlFor="media-upload">
              <Button variant="outline" size="lg" className="w-full" asChild>
                <span className="cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  Add More Photos & Videos
                </span>
              </Button>
            </label>
          </div>

          {/* Videos Section */}
          {mediaFiles.filter(m => m.type === "video").length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Videos</h3>
                  <Badge variant="secondary">{mediaFiles.filter(m => m.type === "video").length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Drag to reorder</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaFiles.filter(m => m.type === "video").map(media => (
                  <div 
                    key={media.id} 
                    className="space-y-2"
                    draggable
                    onDragStart={(e) => handleDragStart(e, media.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, media.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 cursor-move ${
                        media.isHero ? "border-primary ring-2 ring-primary/20" : "border-border"
                      } ${draggedItem === media.id ? "opacity-50" : ""}`}
                    >
                      {media.thumbUrl ? (
                        // Show Bunny.net thumbnail for uploaded videos
                        <img
                          src={media.thumbUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // Show video preview for local files
                        <video
                          src={media.preview}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!media.isHero && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsHero(media.id)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Hero
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMedia(media.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Hero Badge */}
                      {media.isHero && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Hero
                          </Badge>
                        </div>
                      )}

                      {/* Video Icon */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Video className="w-3 h-3" />
                        </Badge>
                      </div>
                    </div>

                    {/* Video Title Input */}
                    <Input
                      placeholder="Video title (e.g., 'The Kitchen', 'Master Bedroom')"
                      value={media.title || ""}
                      onChange={(e) => updateMediaTitle(media.id, e.target.value)}
                      className="text-sm"
                    />
                    
                    {/* Thumbnail Selector - Only for existing Bunny videos */}
                    {media.isExisting && media.providerId && (
                      <VideoThumbnailSelector
                        videoId={media.providerId}
                        currentThumbnailUrl={media.thumbUrl || ""}
                        mediaAssetId={media.id}
                        onThumbnailChange={(newUrl) => handleThumbnailChange(media.id, newUrl)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos Section */}
          {mediaFiles.filter(m => m.type === "photo").length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Photos</h3>
                <Badge variant="secondary">{mediaFiles.filter(m => m.type === "photo").length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaFiles.filter(m => m.type === "photo").map(media => (
                  <div key={media.id} className="space-y-2">
                    <div
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        media.isHero ? "border-primary ring-2 ring-primary/20" : "border-border"
                      }`}
                    >
                      <img
                        src={media.preview}
                        alt="Property"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!media.isHero && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAsHero(media.id)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Hero
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMedia(media.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Hero Badge */}
                      {media.isHero && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Hero
                          </Badge>
                        </div>
                      )}

                      {/* Photo Icon */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <ImageIcon className="w-3 h-3" />
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {mediaFiles.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No media uploaded yet. Add photos and videos to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Villa Sunset"
              className="text-lg"
            />
          </div>

          {/* Price & Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price *
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => {
                  // Remove all non-numeric characters except decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Format with thousand separators
                  const parts = value.split('.');
                  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  const formatted = parts.join('.');
                  setFormData(prev => ({ ...prev, price: formatted }));
                }}
                placeholder="299,900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="123 Ocean Drive, Miami"
              />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beds">
                <Bed className="w-4 h-4 inline mr-1" />
                Beds
              </Label>
              <Input
                id="beds"
                type="text"
                inputMode="numeric"
                value={formData.beds}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, beds: value }));
                }}
                placeholder="3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baths">
                <Bath className="w-4 h-4 inline mr-1" />
                Baths
              </Label>
              <Input
                id="baths"
                type="text"
                inputMode="decimal"
                value={formData.baths}
                onChange={(e) => {
                  // Only allow numbers and single decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
                  setFormData(prev => ({ ...prev, baths: formatted }));
                }}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking">
                <Car className="w-4 h-4 inline mr-1" />
                Parking
              </Label>
              <Input
                id="parking"
                type="text"
                inputMode="numeric"
                value={formData.parking}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, parking: value }));
                }}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqft">
                <Maximize className="w-4 h-4 inline mr-1" />
                Sq Ft
              </Label>
              <Input
                id="sqft"
                type="text"
                inputMode="numeric"
                value={formData.sqft}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({ ...prev, sqft: value }));
                }}
                placeholder="2500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlights/Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Highlights
          </CardTitle>
          <CardDescription>
            Click to add amenities and features (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pre-made Tags */}
          <div className="flex flex-wrap gap-2">
            {AMENITY_TAGS.map(amenity => (
              <Badge
                key={amenity}
                variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleAmenity(amenity)}
              >
                {selectedAmenities.includes(amenity) && (
                  <Check className="w-3 h-3 mr-1" />
                )}
                {amenity}
              </Badge>
            ))}
          </div>

          {/* Custom Amenity */}
          <div className="flex gap-2">
            <Input
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              placeholder="Add custom amenity..."
              onKeyPress={(e) => e.key === "Enter" && addCustomAmenity()}
            />
            <Button onClick={addCustomAmenity} variant="outline">
              Add
            </Button>
          </div>

          {/* Selected Custom Amenities */}
          {selectedAmenities.filter(a => !AMENITY_TAGS.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {selectedAmenities
                .filter(a => !AMENITY_TAGS.includes(a))
                .map(amenity => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>Optional - add more details about the property</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what makes this property special..."
            rows={6}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Also Listed On
          </CardTitle>
          <CardDescription>
            Add links to other platforms (Zillow, Realtor.com, MLS, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Popular Platforms */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Add Popular Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {["Zillow", "Realtor.com", "Redfin", "Trulia", "MLS"].map((platform) => (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewLinkLabel(platform)}
                  className="text-xs"
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>

          {/* Add New Link Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Platform (e.g., Zillow)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
            />
            <Input
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="md:col-span-2"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newLinkLabel && newLinkUrl) {
                setExternalLinks([...externalLinks, { label: newLinkLabel, url: newLinkUrl }]);
                setNewLinkLabel("");
                setNewLinkUrl("");
              }
            }}
            disabled={!newLinkLabel || !newLinkUrl}
          >
            <Check className="w-4 h-4 mr-2" />
            Add Link
          </Button>

          {/* Existing Links */}
          {externalLinks.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              {externalLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{link.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExternalLinks(externalLinks.filter((_, i) => i !== index))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Select Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Agents</CardTitle>
          <CardDescription>Select which agents to show on this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedAgents.includes(agent.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {agent.photoUrl ? (
                  <img
                    src={agent.photoUrl}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.title}</p>
                </div>
                {selectedAgents.includes(agent.id) && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-6 z-10">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to save changes?</p>
                <p className="text-sm text-muted-foreground">
                  Your updates will be saved immediately
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.price || mediaFiles.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
