"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Briefcase, Mail, Phone, MessageCircle, Instagram, Linkedin, Globe,
  Facebook, Check, Loader2, Upload, X, HelpCircle, Video, Calendar, Award,
  TrendingUp, MapPin, Building2, Youtube, Twitter, Plus, Eye, FileText
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileData {
  name: string;
  title: string;
  tagline?: string;
  photoUrl: string;
  bio: string;
  bioLong?: string;
  videoUrl?: string;
  statsJson?: { yearsExperience?: number; homesSold?: string; salesVolume?: string; };
  credentials?: string[];
  email: string;
  phone: string;
  whatsapp: string;
  calendlyUrl?: string;
  useInternalScheduling?: boolean;
  socialLinks: Record<string, string>;
  serviceAreas?: string[];
  brokerageName?: string;
  licenseNumber?: string;
  disclosureText?: string;
}

interface ProfileEditorProps {
  profileId?: string;
  initialData: ProfileData;
  neighborhoods?: Array<{ id: string; name: string }>;
}

export function ProfileEditor({ profileId, initialData, neighborhoods = [] }: ProfileEditorProps) {
  const [data, setData] = useState<ProfileData>({
    ...initialData,
    tagline: initialData.tagline || "",
    bioLong: initialData.bioLong || "",
    videoUrl: initialData.videoUrl || "",
    statsJson: initialData.statsJson || {},
    credentials: initialData.credentials || [],
    calendlyUrl: initialData.calendlyUrl || "",
    useInternalScheduling: initialData.useInternalScheduling || false,
    serviceAreas: initialData.serviceAreas || [],
    brokerageName: initialData.brokerageName || "",
    licenseNumber: initialData.licenseNumber || "",
    disclosureText: initialData.disclosureText || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialData.photoUrl);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [newCredential, setNewCredential] = useState("");

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(data) !== JSON.stringify(initialData)) {
        handleSave();
      }
    }, 1500);
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

  const updateField = (field: keyof ProfileData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateStat = (key: string, value: string | number) => {
    setData(prev => ({
      ...prev,
      statsJson: { ...prev.statsJson, [key]: value },
    }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const addCredential = () => {
    if (newCredential.trim()) {
      setData(prev => ({
        ...prev,
        credentials: [...(prev.credentials || []), newCredential.trim()],
      }));
      setNewCredential("");
    }
  };

  const removeCredential = (index: number) => {
    setData(prev => ({
      ...prev,
      credentials: (prev.credentials || []).filter((_, i) => i !== index),
    }));
  };

  const toggleServiceArea = (neighborhoodId: string) => {
    setData(prev => ({
      ...prev,
      serviceAreas: (prev.serviceAreas || []).includes(neighborhoodId)
        ? (prev.serviceAreas || []).filter(id => id !== neighborhoodId)
        : [...(prev.serviceAreas || []), neighborhoodId],
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const HelpTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your professional identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center">
                Profile Photo
                <HelpTooltip content="Professional headshot, ideally square format. This appears on property pages and your Hub." />
              </Label>
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

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Professional Title *
                <HelpTooltip content="Your role or specialty. Examples: 'Luxury Real Estate Specialist', 'Waterfront Properties Expert'" />
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Luxury Real Estate Specialist"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline" className="flex items-center">
                Tagline / Headline
                <HelpTooltip content="Short, catchy headline for your Hub hero section. Keep it under 60 characters." />
              </Label>
              <Input
                id="tagline"
                value={data.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="Your Trusted Guide to Miami Luxury Homes"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {(data.tagline || "").length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center">
                Bio (Short)
                <HelpTooltip content="Brief introduction for property pages. 2-3 sentences about your expertise." />
              </Label>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Specializing in luxury waterfront properties with 15+ years of experience..."
                rows={3}
                maxLength={300}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {data.bio.length}/300 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bioLong" className="flex items-center">
                Bio (Extended)
                <HelpTooltip content="Detailed bio for your Hub About section. Tell your story, expertise, and what makes you unique." />
              </Label>
              <Textarea
                id="bioLong"
                value={data.bioLong}
                onChange={(e) => updateField("bioLong", e.target.value)}
                placeholder="With over 15 years of experience in South Florida real estate..."
                rows={6}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {(data.bioLong || "").length}/1000 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Professional Stats & Credentials
            </CardTitle>
            <CardDescription>
              Showcase your experience (appears in Hub About section)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years" className="text-xs">Years</Label>
                <Input
                  id="years"
                  type="number"
                  value={data.statsJson?.yearsExperience || ""}
                  onChange={(e) => updateStat("yearsExperience", parseInt(e.target.value) || 0)}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homes" className="text-xs">Homes Sold</Label>
                <Input
                  id="homes"
                  value={data.statsJson?.homesSold || ""}
                  onChange={(e) => updateStat("homesSold", e.target.value)}
                  placeholder="250+"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-xs">Volume</Label>
                <Input
                  id="volume"
                  value={data.statsJson?.salesVolume || ""}
                  onChange={(e) => updateStat("salesVolume", e.target.value)}
                  placeholder="$75M+"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center">
                <Award className="w-4 h-4 inline mr-2" />
                Credentials & Certifications
                <HelpTooltip content="Add your certifications, awards, and specializations. They appear as badges in your Hub." />
              </Label>
              <div className="flex flex-wrap gap-2">
                {(data.credentials || []).map((cred, index) => (
                  <Badge key={index} variant="secondary" className="pl-3 pr-1">
                    {cred}
                    <button
                      onClick={() => removeCredential(index)}
                      className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCredential}
                  onChange={(e) => setNewCredential(e.target.value)}
                  placeholder="e.g., Luxury Home Specialist"
                  onKeyPress={(e) => e.key === "Enter" && addCredential()}
                />
                <Button onClick={addCredential} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How clients can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Scheduling Options
            </CardTitle>
            <CardDescription>
              Let clients book time with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="internal-scheduling" className="font-medium">
                  Use Internal Scheduling
                </Label>
                <p className="text-xs text-muted-foreground">
                  Leads go directly to your CRM dashboard
                </p>
              </div>
              <Switch
                id="internal-scheduling"
                checked={data.useInternalScheduling}
                onCheckedChange={(checked) => updateField("useInternalScheduling", checked)}
              />
            </div>

            {!data.useInternalScheduling && (
              <div className="space-y-2">
                <Label htmlFor="calendly" className="flex items-center">
                  Calendly Link
                  <HelpTooltip content="Paste your Calendly scheduling link. Clients can book appointments directly." />
                </Label>
                <Input
                  id="calendly"
                  value={data.calendlyUrl}
                  onChange={(e) => updateField("calendlyUrl", e.target.value)}
                  placeholder="https://calendly.com/yourusername"
                />
              </div>
            )}

            {data.useInternalScheduling && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  ✓ Tour requests will appear in your Leads dashboard
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your social profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Facebook, name: "facebook", placeholder: "username or full URL" },
              { icon: Instagram, name: "instagram", placeholder: "username or full URL" },
              { icon: Linkedin, name: "linkedin", placeholder: "username or full URL" },
              { icon: Youtube, name: "youtube", placeholder: "channel URL" },
              { icon: Twitter, name: "twitter", placeholder: "@username" },
              { icon: Globe, name: "website", placeholder: "https://yourwebsite.com" },
            ].map(({ icon: Icon, name, placeholder }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>
                  <Icon className="w-4 h-4 inline mr-2" />
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Label>
                <Input
                  id={name}
                  value={data.socialLinks[name] || ""}
                  onChange={(e) => updateSocialLink(name, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service Areas */}
        {neighborhoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Service Areas
              </CardTitle>
              <CardDescription>
                Select neighborhoods you serve (appears in Hub)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {neighborhoods.map((neighborhood) => (
                  <div
                    key={neighborhood.id}
                    onClick={() => toggleServiceArea(neighborhood.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      (data.serviceAreas || []).includes(neighborhood.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          (data.serviceAreas || []).includes(neighborhood.id)
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {(data.serviceAreas || []).includes(neighborhood.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{neighborhood.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brokerage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Brokerage Information
            </CardTitle>
            <CardDescription>
              Legal & compliance info (appears in Hub footer)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brokerage">Brokerage Name</Label>
              <Input
                id="brokerage"
                value={data.brokerageName}
                onChange={(e) => updateField("brokerageName", e.target.value)}
                placeholder="Your Brokerage Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={data.licenseNumber}
                onChange={(e) => updateField("licenseNumber", e.target.value)}
                placeholder="FL BK3456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disclosure" className="flex items-center">
                Disclosure Text
                <HelpTooltip content="Legal disclosure that appears in your Hub footer." />
              </Label>
              <Textarea
                id="disclosure"
                value={data.disclosureText}
                onChange={(e) => updateField("disclosureText", e.target.value)}
                placeholder="Licensed Real Estate Broker in the State of Florida. Equal Housing Opportunity."
                rows={3}
                className="resize-none"
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
      <div className="lg:sticky lg:top-24 h-fit space-y-6">
        <Tabs defaultValue="property" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="property">Property Card</TabsTrigger>
            <TabsTrigger value="hub">Hub Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Page Preview</CardTitle>
                <CardDescription>How you appear on listings</CardDescription>
              </CardHeader>
              <CardContent>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hub" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Hub Preview</CardTitle>
                <CardDescription>How your Hub will look</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.tagline && (
                  <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg text-white">
                    <h3 className="text-xl font-bold">{data.tagline}</h3>
                    <p className="text-sm mt-1 opacity-90">Hero Section</p>
                  </div>
                )}

                {(data.statsJson?.yearsExperience || data.statsJson?.homesSold || data.statsJson?.salesVolume) && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-3">About Section Stats</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {data.statsJson?.yearsExperience && (
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {data.statsJson.yearsExperience}+
                          </div>
                          <div className="text-xs text-muted-foreground">Years</div>
                        </div>
                      )}
                      {data.statsJson?.homesSold && (
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {data.statsJson.homesSold}
                          </div>
                          <div className="text-xs text-muted-foreground">Sold</div>
                        </div>
                      )}
                      {data.statsJson?.salesVolume && (
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {data.statsJson.salesVolume}
                          </div>
                          <div className="text-xs text-muted-foreground">Volume</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(data.credentials || []).length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Credentials</p>
                    <div className="flex flex-wrap gap-2">
                      {(data.credentials || []).map((cred, i) => (
                        <Badge key={i} variant="secondary">{cred}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(data.serviceAreas || []).length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      ✓ Serving {(data.serviceAreas || []).length} neighborhoods
                    </p>
                  </div>
                )}

                {!data.tagline && !data.statsJson?.yearsExperience && (data.credentials || []).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Fill out your profile to see Hub preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
