'use client'

import { AboutBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/upload/image-upload'
import { X, Plus } from 'lucide-react'

interface AboutSettingsProps {
  settings: AboutBlockSettings
  onChange: (settings: AboutBlockSettings) => void
}

export function AboutSettingsNew({ settings, onChange }: AboutSettingsProps) {
  // Ensure settings have safe defaults
  const safeSettings: AboutBlockSettings = {
    photoUrl: settings?.photoUrl || '',
    bioShort: settings?.bioShort || '',
    bioLong: settings?.bioLong || '',
    videoUrl: settings?.videoUrl || '',
    showStats: settings?.showStats ?? true,
    stats: settings?.stats || { years: 0, homesSold: 0, volume: '' },
    showCredentials: settings?.showCredentials ?? true,
    credentials: settings?.credentials || [],
    ctaText: settings?.ctaText || '',
    ctaLink: settings?.ctaLink || '',
    layout: settings?.layout || 'left',
  }

  const updateSetting = <K extends keyof AboutBlockSettings>(
    key: K,
    value: AboutBlockSettings[K]
  ) => {
    onChange({ ...safeSettings, [key]: value })
  }

  const updateStats = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      stats: {
        ...safeSettings.stats,
        [field]: value,
      },
    })
  }

  const addCredential = () => {
    onChange({
      ...safeSettings,
      credentials: [...(safeSettings.credentials || []), ''],
    })
  }

  const updateCredential = (index: number, value: string) => {
    const newCredentials = [...(safeSettings.credentials || [])]
    newCredentials[index] = value
    onChange({
      ...safeSettings,
      credentials: newCredentials,
    })
  }

  const removeCredential = (index: number) => {
    onChange({
      ...safeSettings,
      credentials: safeSettings.credentials?.filter((_, i) => i !== index) || [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="space-y-3">
        <Label>Profile Photo</Label>
        {safeSettings.photoUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-[3/4] max-w-xs rounded-lg overflow-hidden border">
              <img
                src={safeSettings.photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => updateSetting('photoUrl', '')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <ImageUpload
            onUploadComplete={(data) => updateSetting('photoUrl', data.url)}
            folder="/hub/about"
            showPreview={true}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 600x800px (portrait orientation)
        </p>
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video Introduction URL (Optional)</Label>
        <Input
          id="videoUrl"
          type="url"
          placeholder="https://example.com/video.mp4"
          value={safeSettings.videoUrl}
          onChange={(e) => updateSetting('videoUrl', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Add a video to show a play button over your photo
        </p>
      </div>

      {/* Bio Short (Headline) */}
      <div className="space-y-2">
        <Label htmlFor="bioShort">Headline</Label>
        <Input
          id="bioShort"
          placeholder="Your Trusted Real Estate Partner"
          value={safeSettings.bioShort}
          onChange={(e) => updateSetting('bioShort', e.target.value)}
        />
      </div>

      {/* Bio Long */}
      <div className="space-y-2">
        <Label htmlFor="bioLong">Bio</Label>
        <Textarea
          id="bioLong"
          placeholder="Tell your story..."
          value={safeSettings.bioLong}
          onChange={(e) => updateSetting('bioLong', e.target.value)}
          rows={6}
        />
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label>Photo Position</Label>
        <Select
          value={safeSettings.layout}
          onValueChange={(value: any) => updateSetting('layout', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="center">Center (Stacked)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-base">Show Stats</Label>
            <p className="text-xs text-muted-foreground">
              Display your achievements
            </p>
          </div>
          <Switch
            checked={safeSettings.showStats}
            onCheckedChange={(checked) => updateSetting('showStats', checked)}
          />
        </div>

        {safeSettings.showStats && (
          <div className="space-y-4 pl-4 border-l-2">
            <div className="space-y-2">
              <Label htmlFor="years">Years of Experience</Label>
              <Input
                id="years"
                type="number"
                placeholder="10"
                value={safeSettings.stats?.years || ''}
                onChange={(e) => updateStats('years', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homesSold">Homes Sold</Label>
              <Input
                id="homesSold"
                type="number"
                placeholder="100"
                value={safeSettings.stats?.homesSold || ''}
                onChange={(e) => updateStats('homesSold', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Sales Volume</Label>
              <Input
                id="volume"
                placeholder="$25M+"
                value={safeSettings.stats?.volume || ''}
                onChange={(e) => updateStats('volume', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Credentials Toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-base">Show Credentials</Label>
            <p className="text-xs text-muted-foreground">
              Display certifications and designations
            </p>
          </div>
          <Switch
            checked={safeSettings.showCredentials}
            onCheckedChange={(checked) => updateSetting('showCredentials', checked)}
          />
        </div>

        {safeSettings.showCredentials && (
          <div className="space-y-3 pl-4 border-l-2">
            {safeSettings.credentials && safeSettings.credentials.length > 0 ? (
              safeSettings.credentials.map((credential, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="REALTOR®, CRS, etc."
                    value={credential}
                    onChange={(e) => updateCredential(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCredential(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={addCredential}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t pt-6">
        <Label className="text-base mb-4 block">Call-to-Action (Optional)</Label>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Button Text</Label>
            <Input
              id="ctaText"
              placeholder="Learn More"
              value={safeSettings.ctaText}
              onChange={(e) => updateSetting('ctaText', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaLink">Button Link</Label>
            <Input
              id="ctaLink"
              type="url"
              placeholder="https://example.com"
              value={safeSettings.ctaLink}
              onChange={(e) => updateSetting('ctaLink', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Validation Note */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-1">Publishing Requirements:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>At least one of: Photo, Headline, or Bio</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Section will show a placeholder in the editor until complete.
        </p>
      </div>
    </div>
  )
}
