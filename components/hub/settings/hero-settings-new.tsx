'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/upload/image-upload'
import { HeroBlockSettings, CtaActionType } from '@/lib/types/hub-blocks'
import { X } from 'lucide-react'

interface HeroSettingsProps {
  settings: HeroBlockSettings
  onChange: (settings: HeroBlockSettings) => void
}

const CTA_ACTIONS: { value: CtaActionType; label: string }[] = [
  { value: 'anchor', label: 'Scroll to Section' },
  { value: 'contact', label: 'Contact Form' },
  { value: 'schedule', label: 'Schedule Tour' },
  { value: 'valuation', label: 'Home Valuation' },
  { value: 'mortgage', label: 'Mortgage Calculator' },
  { value: 'url', label: 'External Link' },
]

const SECTION_ANCHORS = [
  { value: '#properties', label: 'Properties' },
  { value: '#about', label: 'About' },
  { value: '#neighborhoods', label: 'Neighborhoods' },
  { value: '#testimonials', label: 'Testimonials' },
  { value: '#contact', label: 'Contact' },
  { value: '#mortgage-calculator', label: 'Mortgage Calculator' },
]

export function HeroSettingsNew({ settings, onChange }: HeroSettingsProps) {
  // Ensure settings have safe defaults
  const safeSettings: HeroBlockSettings = {
    headline: settings?.headline || '',
    tagline: settings?.tagline || '',
    backgroundImage: settings?.backgroundImage || { url: '', alt: '' },
    overlay: settings?.overlay || 'balanced',
    textAlign: settings?.textAlign || 'center',
    primaryCta: settings?.primaryCta || {
      label: 'View My Listings',
      action: { type: 'anchor', value: '#properties' },
    },
    secondaryCta: settings?.secondaryCta || { enabled: false },
    showAgencyLogo: settings?.showAgencyLogo || false,
  }

  const updateSetting = <K extends keyof HeroBlockSettings>(
    key: K,
    value: HeroBlockSettings[K]
  ) => {
    onChange({ ...safeSettings, [key]: value })
  }

  const updatePrimaryCta = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      primaryCta: {
        ...safeSettings.primaryCta,
        [field]: value,
      },
    })
  }

  const updatePrimaryCtaAction = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      primaryCta: {
        ...safeSettings.primaryCta,
        action: {
          ...safeSettings.primaryCta.action,
          [field]: value,
        },
      },
    })
  }

  const updateSecondaryCta = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      secondaryCta: {
        ...safeSettings.secondaryCta,
        [field]: value,
      },
    })
  }

  const updateSecondaryCtaAction = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      secondaryCta: {
        ...safeSettings.secondaryCta,
        action: {
          ...(safeSettings.secondaryCta.action || { type: 'contact' }),
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Background Image */}
      <div className="space-y-3">
        <Label>Background Image *</Label>
        {safeSettings.backgroundImage.url ? (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <img
                src={safeSettings.backgroundImage.url}
                alt={safeSettings.backgroundImage.alt}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() =>
                  updateSetting('backgroundImage', { url: '', alt: '' })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="alt">Alt Text *</Label>
              <Input
                id="alt"
                placeholder="Describe the image"
                value={safeSettings.backgroundImage.alt}
                onChange={(e) =>
                  updateSetting('backgroundImage', {
                    ...safeSettings.backgroundImage,
                    alt: e.target.value,
                  })
                }
              />
            </div>
          </div>
        ) : (
          <ImageUpload
            onUploadComplete={(data) =>
              updateSetting('backgroundImage', {
                url: data.url,
                alt: 'Hero background',
              })
            }
            folder="/hub/hero"
            showPreview={true}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Recommended: 1920x1080px or larger. Will be optimized for all devices.
        </p>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline">Headline *</Label>
        <Input
          id="headline"
          placeholder="Welcome to My Hub"
          value={safeSettings.headline}
          onChange={(e) => updateSetting('headline', e.target.value)}
        />
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          placeholder="Your trusted real estate partner"
          value={safeSettings.tagline}
          onChange={(e) => updateSetting('tagline', e.target.value)}
        />
      </div>

      {/* Overlay Preset */}
      <div className="space-y-2">
        <Label>Overlay Darkness</Label>
        <RadioGroup
          value={safeSettings.overlay}
          onValueChange={(value: any) => updateSetting('overlay', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="font-normal">
              Light (30% dark)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="balanced" id="balanced" />
            <Label htmlFor="balanced" className="font-normal">
              Balanced (45% dark) - Recommended
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="font-normal">
              Dark (60% dark)
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          Controls text readability over the background
        </p>
      </div>

      {/* Text Position */}
      <div className="space-y-2">
        <Label>Text Position (Desktop)</Label>
        <Select
          value={safeSettings.textAlign}
          onValueChange={(value: any) => updateSetting('textAlign', value)}
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
        <p className="text-xs text-muted-foreground">
          Mobile is always centered
        </p>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Primary Call-to-Action *</h3>

        {/* Primary CTA Label */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="primaryLabel">Button Text *</Label>
          <Input
            id="primaryLabel"
            placeholder="View My Listings"
            value={safeSettings.primaryCta.label}
            onChange={(e) => updatePrimaryCta('label', e.target.value)}
          />
        </div>

        {/* Primary CTA Action Type */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="primaryAction">Action *</Label>
          <Select
            value={safeSettings.primaryCta.action.type}
            onValueChange={(value) => updatePrimaryCtaAction('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CTA_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary CTA Value (conditional) */}
        {safeSettings.primaryCta.action.type === 'anchor' && (
          <div className="space-y-2">
            <Label htmlFor="primaryValue">Section</Label>
            <Select
              value={safeSettings.primaryCta.action.value || '#properties'}
              onValueChange={(value) => updatePrimaryCtaAction('value', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_ANCHORS.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {safeSettings.primaryCta.action.type === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="primaryUrl">URL</Label>
            <Input
              id="primaryUrl"
              type="url"
              placeholder="https://example.com"
              value={safeSettings.primaryCta.action.value || ''}
              onChange={(e) => updatePrimaryCtaAction('value', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Secondary CTA */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Secondary Call-to-Action</h3>
          <Switch
            checked={safeSettings.secondaryCta.enabled}
            onCheckedChange={(checked) =>
              updateSecondaryCta('enabled', checked)
            }
          />
        </div>

        {safeSettings.secondaryCta.enabled && (
          <div className="space-y-4">
            {/* Secondary CTA Label */}
            <div className="space-y-2">
              <Label htmlFor="secondaryLabel">Button Text</Label>
              <Input
                id="secondaryLabel"
                placeholder="Get a Home Valuation"
                value={safeSettings.secondaryCta.label || ''}
                onChange={(e) => updateSecondaryCta('label', e.target.value)}
              />
            </div>

            {/* Secondary CTA Action Type */}
            <div className="space-y-2">
              <Label htmlFor="secondaryAction">Action</Label>
              <Select
                value={safeSettings.secondaryCta.action?.type || 'contact'}
                onValueChange={(value) =>
                  updateSecondaryCtaAction('type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CTA_ACTIONS.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary CTA Value (conditional) */}
            {safeSettings.secondaryCta.action?.type === 'anchor' && (
              <div className="space-y-2">
                <Label htmlFor="secondaryValue">Section</Label>
                <Select
                  value={safeSettings.secondaryCta.action.value || '#contact'}
                  onValueChange={(value) =>
                    updateSecondaryCtaAction('value', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_ANCHORS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {safeSettings.secondaryCta.action?.type === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="secondaryUrl">URL</Label>
                <Input
                  id="secondaryUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={safeSettings.secondaryCta.action.value || ''}
                  onChange={(e) =>
                    updateSecondaryCtaAction('value', e.target.value)
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Note */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-1">Publishing Requirements:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Background image uploaded</li>
          <li>Headline text added</li>
          <li>Primary CTA configured</li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Hero section will show a placeholder in the editor until complete.
        </p>
      </div>
    </div>
  )
}
