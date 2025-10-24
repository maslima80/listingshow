'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface HeroSettingsProps {
  settings: any
  onChange: (settings: any) => void
}

export function HeroSettings({ settings, onChange }: HeroSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Background Type</Label>
        <Select
          value={settings.backgroundType || 'gradient'}
          onValueChange={(value) => updateSetting('backgroundType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {settings.backgroundType === 'image' && (
        <div className="space-y-2">
          <Label>Background Image URL</Label>
          <Input
            placeholder="https://..."
            value={settings.backgroundUrl || ''}
            onChange={(e) => updateSetting('backgroundUrl', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Upload image to ImageKit and paste URL here
          </p>
        </div>
      )}

      {settings.backgroundType === 'video' && (
        <div className="space-y-2">
          <Label>Background Video URL</Label>
          <Input
            placeholder="https://..."
            value={settings.backgroundUrl || ''}
            onChange={(e) => updateSetting('backgroundUrl', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            MP4, WebM, or YouTube embed URL
          </p>
        </div>
      )}

      {settings.backgroundType === 'gradient' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gradient From</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.gradientFrom || '#1e3a8a'}
                onChange={(e) => updateSetting('gradientFrom', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={settings.gradientFrom || '#1e3a8a'}
                onChange={(e) => updateSetting('gradientFrom', e.target.value)}
                placeholder="#1e3a8a"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gradient To</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.gradientTo || '#7c3aed'}
                onChange={(e) => updateSetting('gradientTo', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={settings.gradientTo || '#7c3aed'}
                onChange={(e) => updateSetting('gradientTo', e.target.value)}
                placeholder="#7c3aed"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Headline *</Label>
        <Input
          placeholder="Welcome to My Hub"
          value={settings.headline || ''}
          onChange={(e) => updateSetting('headline', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Tagline</Label>
        <Input
          placeholder="Your trusted real estate partner"
          value={settings.tagline || ''}
          onChange={(e) => updateSetting('tagline', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Call to Action Text</Label>
        <Input
          placeholder="View My Listings"
          value={settings.ctaText || ''}
          onChange={(e) => updateSetting('ctaText', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>CTA Link</Label>
        <Input
          placeholder="#properties"
          value={settings.ctaLink || ''}
          onChange={(e) => updateSetting('ctaLink', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Use #properties, #contact, or any URL
        </p>
      </div>

      <div className="space-y-2">
        <Label>Text Position</Label>
        <Select
          value={settings.textPosition || 'center'}
          onValueChange={(value) => updateSetting('textPosition', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
