'use client'

import { useState } from 'react'
import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface ContactSettingsProps {
  settings: ContactBlockSettings
  onChange: (settings: ContactBlockSettings) => void
}

export function ContactSettings({ settings, onChange }: ContactSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ContactBlockSettings>(settings)

  const handleChange = (updates: Partial<ContactBlockSettings>) => {
    const newSettings = { ...localSettings, ...updates }
    setLocalSettings(newSettings)
    onChange(newSettings)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Section Title</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={localSettings.headline}
              onChange={(e) => handleChange({ headline: e.target.value })}
              placeholder="Let's Connect"
            />
          </div>

          <div>
            <Label htmlFor="subline">Subline</Label>
            <Input
              id="subline"
              value={localSettings.subline}
              onChange={(e) => handleChange({ subline: e.target.value })}
              placeholder="Reach out to discuss your real estate needs."
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showSchedule">Show Schedule Button</Label>
              <p className="text-sm text-muted-foreground">Opens scheduling modal</p>
            </div>
            <Switch
              id="showSchedule"
              checked={localSettings.showSchedule}
              onCheckedChange={(checked) => handleChange({ showSchedule: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showEmail">Show Email Button</Label>
              <p className="text-sm text-muted-foreground">Scrolls to contact form</p>
            </div>
            <Switch
              id="showEmail"
              checked={localSettings.showEmail}
              onCheckedChange={(checked) => handleChange({ showEmail: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showCall">Show Call Button</Label>
              <p className="text-sm text-muted-foreground">Opens phone dialer</p>
            </div>
            <Switch
              id="showCall"
              checked={localSettings.showCall}
              onCheckedChange={(checked) => handleChange({ showCall: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showSocialLinks">Show Social Links</Label>
              <p className="text-sm text-muted-foreground">From Profile Manager</p>
            </div>
            <Switch
              id="showSocialLinks"
              checked={localSettings.showSocialLinks}
              onCheckedChange={(checked) => handleChange({ showSocialLinks: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showCompliance">Show Compliance Info</Label>
              <p className="text-sm text-muted-foreground">Brokerage, license, disclosure</p>
            </div>
            <Switch
              id="showCompliance"
              checked={localSettings.showCompliance}
              onCheckedChange={(checked) => handleChange({ showCompliance: checked })}
            />
          </div>

          <div>
            <Label htmlFor="anchorId">Anchor ID</Label>
            <Input
              id="anchorId"
              value={localSettings.anchorId}
              onChange={(e) => handleChange({ anchorId: e.target.value })}
              placeholder="contact"
            />
            <p className="text-sm text-muted-foreground mt-1">
              For smooth scrolling from Hero CTA (e.g., #contact)
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> Contact form is always visible. Phone and email are pulled from your Profile Manager. Schedule button appears if "Use Internal Scheduling" is enabled in your profile.
        </p>
      </div>
    </div>
  )
}
