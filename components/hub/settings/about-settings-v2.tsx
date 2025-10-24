'use client'

import { AboutBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface AboutSettingsV2Props {
  settings: AboutBlockSettings
  onChange: (settings: AboutBlockSettings) => void
}

const CTA_ACTIONS = [
  { value: 'contact', label: 'Contact Form' },
  { value: 'schedule', label: 'Schedule Tour' },
  { value: 'valuation', label: 'Home Valuation' },
  { value: 'anchor', label: 'Scroll to Section' },
  { value: 'url', label: 'External Link' },
]

const SECTION_ANCHORS = [
  { value: '#properties', label: 'Properties' },
  { value: '#neighborhoods', label: 'Neighborhoods' },
  { value: '#testimonials', label: 'Testimonials' },
  { value: '#contact', label: 'Contact' },
]

export function AboutSettingsV2({ settings, onChange }: AboutSettingsV2Props) {
  // Ensure safe defaults
  const safeSettings: AboutBlockSettings = {
    useProfile: settings?.useProfile ?? true,
    override: settings?.override || {},
    show: settings?.show || {
      photo: true,
      shortBio: true,
      extendedBio: false,
      videoIntro: false,
      stats: true,
      credentials: true,
      socialLinks: true,
    },
    layout: settings?.layout || 'photoLeft',
    cta: settings?.cta || { enabled: false },
  }

  const updateSetting = <K extends keyof AboutBlockSettings>(
    key: K,
    value: AboutBlockSettings[K]
  ) => {
    onChange({ ...safeSettings, [key]: value })
  }

  const updateShow = (field: keyof AboutBlockSettings['show'], value: boolean) => {
    onChange({
      ...safeSettings,
      show: {
        ...safeSettings.show,
        [field]: value,
      },
    })
  }

  const updateCta = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      cta: {
        enabled: safeSettings.cta?.enabled || false,
        ...safeSettings.cta,
        [field]: value,
      },
    })
  }

  const updateCtaAction = (field: string, value: any) => {
    onChange({
      ...safeSettings,
      cta: {
        enabled: safeSettings.cta?.enabled || false,
        ...safeSettings.cta,
        action: {
          type: 'contact',
          ...(safeSettings.cta?.action || {}),
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Content Source */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Use my Profile</Label>
            <p className="text-xs text-muted-foreground">
              Pull content from your Profile Manager
            </p>
          </div>
          <Switch
            checked={safeSettings.useProfile}
            onCheckedChange={(checked) => updateSetting('useProfile', checked)}
          />
        </div>

        {safeSettings.useProfile && (
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Using Profile Data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your name, photo, bio, stats, and credentials will be pulled automatically.
                </p>
              </div>
            </div>
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}

        {!safeSettings.useProfile && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Custom content mode is not yet implemented. 
              Please use Profile Manager for now.
            </p>
          </div>
        )}
      </div>

      {/* What to Show */}
      <div className="border-t pt-6">
        <Label className="text-base mb-4 block">What to Show</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-photo" className="font-normal">Photo</Label>
            <Switch
              id="show-photo"
              checked={safeSettings.show.photo}
              onCheckedChange={(checked) => updateShow('photo', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-short-bio" className="font-normal">Short Bio</Label>
            <Switch
              id="show-short-bio"
              checked={safeSettings.show.shortBio}
              onCheckedChange={(checked) => updateShow('shortBio', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-extended-bio" className="font-normal">Extended Bio</Label>
            <Switch
              id="show-extended-bio"
              checked={safeSettings.show.extendedBio}
              onCheckedChange={(checked) => updateShow('extendedBio', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-video" className="font-normal">Video Introduction</Label>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch
              id="show-video"
              checked={safeSettings.show.videoIntro}
              onCheckedChange={(checked) => updateShow('videoIntro', checked)}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-stats" className="font-normal">Stats (Years, Homes, Volume)</Label>
            <Switch
              id="show-stats"
              checked={safeSettings.show.stats}
              onCheckedChange={(checked) => updateShow('stats', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-credentials" className="font-normal">Credentials & Awards</Label>
            <Switch
              id="show-credentials"
              checked={safeSettings.show.credentials}
              onCheckedChange={(checked) => updateShow('credentials', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-social" className="font-normal">Social Links</Label>
            <Switch
              id="show-social"
              checked={safeSettings.show.socialLinks}
              onCheckedChange={(checked) => updateShow('socialLinks', checked)}
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="border-t pt-6">
        <Label className="text-base mb-3 block">Layout</Label>
        <Select
          value={safeSettings.layout}
          onValueChange={(value: any) => updateSetting('layout', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photoLeft">Photo Left (Card Style)</SelectItem>
            <SelectItem value="photoTop">Photo Top (Full Width)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Photo Left: Smaller photo card on left, content on right<br />
          Photo Top: Large photo on top, centered content below
        </p>
      </div>

      {/* CTA */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-base">Call-to-Action</Label>
            <p className="text-xs text-muted-foreground">Optional button below content</p>
          </div>
          <Switch
            checked={safeSettings.cta?.enabled || false}
            onCheckedChange={(checked) => updateCta('enabled', checked)}
          />
        </div>

        {safeSettings.cta?.enabled && (
          <div className="space-y-4 pl-4 border-l-2">
            <div className="space-y-2">
              <Label htmlFor="cta-label">Button Text</Label>
              <Input
                id="cta-label"
                placeholder="Learn More"
                value={safeSettings.cta.label || ''}
                onChange={(e) => updateCta('label', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-action">Action</Label>
              <Select
                value={safeSettings.cta.action?.type || 'contact'}
                onValueChange={(value) => updateCtaAction('type', value)}
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

            {safeSettings.cta.action?.type === 'anchor' && (
              <div className="space-y-2">
                <Label htmlFor="cta-anchor">Section</Label>
                <Select
                  value={safeSettings.cta.action.value || '#properties'}
                  onValueChange={(value) => updateCtaAction('value', value)}
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

            {safeSettings.cta.action?.type === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="cta-url">URL</Label>
                <Input
                  id="cta-url"
                  type="url"
                  placeholder="https://example.com"
                  value={safeSettings.cta.action.value || ''}
                  onChange={(e) => updateCtaAction('value', e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-1">How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Content pulls from your Profile Manager</li>
          <li>Toggle what sections to display</li>
          <li>Choose your preferred layout</li>
          <li>Add an optional call-to-action</li>
        </ul>
      </div>
    </div>
  )
}
