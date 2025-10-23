"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Linkedin, 
  Globe,
  Facebook,
  Check,
  Loader2,
  Upload,
  X
} from "lucide-react";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  photoUrl: string;
  socialLinks: Record<string, string>;
}

interface ProfileEditorProps {
  profileId?: string;
  initialData: ProfileData;
}

export function ProfileEditor({ profileId, initialData }: ProfileEditorProps) {
  const [data, setData] = useState<ProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialData.photoUrl);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Auto-save with debounce
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (JSON.stringify(data) !== JSON.stringify(initialData)) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, ...data }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to your storage service
      // For now, create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        updateField("photoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview("");
    updateField("photoUrl", "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your professional identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or WebP. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Smith"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Professional Title *
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Luxury Real Estate Specialist"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell clients about your expertise and what makes you unique..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {data.bio.length}/300 characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How clients can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={data.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground">
                Include country code for international clients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your social profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook">
                <Facebook className="w-4 h-4 inline mr-2" />
                Facebook
              </Label>
              <Input
                id="facebook"
                value={data.socialLinks.facebook || ""}
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="https://facebook.com/yourusername"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">
                <Instagram className="w-4 h-4 inline mr-2" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={data.socialLinks.instagram || ""}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin">
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={data.socialLinks.linkedin || ""}
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </Label>
              <Input
                id="website"
                value={data.socialLinks.website || ""}
                onChange={(e) => updateSocialLink("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            ) : showSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Saved!</span>
              </>
            ) : (
              <span className="text-muted-foreground">Changes auto-save</span>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:sticky lg:top-24 h-fit">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How you'll appear on property pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Agent Card Preview */}
              <div className="p-6 bg-muted rounded-xl">
                <div className="flex items-start gap-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={data.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-background"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 border-background">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">
                      {data.name || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.title || "Your Title"}
                    </p>
                    {data.bio && (
                      <p className="text-sm mt-2 line-clamp-3">
                        {data.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.email && (
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  )}
                  {data.phone && (
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                  {data.whatsapp && (
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>

                {/* Social Links */}
                {(data.socialLinks.facebook || data.socialLinks.instagram || data.socialLinks.linkedin || data.socialLinks.website) && (
                  <div className="mt-4 flex gap-2">
                    {data.socialLinks.facebook && (
                      <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-background/80 transition-colors">
                        <Facebook className="w-4 h-4" />
                      </button>
                    )}
                    {data.socialLinks.instagram && (
                      <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-background/80 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </button>
                    )}
                    {data.socialLinks.linkedin && (
                      <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-background/80 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </button>
                    )}
                    {data.socialLinks.website && (
                      <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center hover:bg-background/80 transition-colors">
                        <Globe className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                This card will appear at the bottom of every property page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
