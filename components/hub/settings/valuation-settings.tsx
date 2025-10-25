'use client'

import { useState } from 'react'
import { ValuationBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface ValuationSettingsProps {
  settings: ValuationBlockSettings
  onChange: (settings: ValuationBlockSettings) => void
}

export function ValuationSettings({ settings, onChange }: ValuationSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ValuationBlockSettings>(settings)

  const handleChange = (updates: Partial<ValuationBlockSettings>) => {
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
              placeholder="What's your home worth today?"
            />
          </div>

          <div>
            <Label htmlFor="subline">Subline</Label>
            <Input
              id="subline"
              value={localSettings.subline}
              onChange={(e) => handleChange({ subline: e.target.value })}
              placeholder="Get a free personalized valuation — no cost, no obligation."
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* CTA & Success Messages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Messages</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ctaLabel">Submit Button Label</Label>
            <Input
              id="ctaLabel"
              value={localSettings.ctaLabel}
              onChange={(e) => handleChange({ ctaLabel: e.target.value })}
              placeholder="Get My Valuation"
            />
          </div>

          <div>
            <Label htmlFor="successTitle">Success Title</Label>
            <Input
              id="successTitle"
              value={localSettings.successTitle}
              onChange={(e) => handleChange({ successTitle: e.target.value })}
              placeholder="Thanks! We received your request."
            />
          </div>

          <div>
            <Label htmlFor="successSub">Success Message</Label>
            <Textarea
              id="successSub"
              value={localSettings.successSub}
              onChange={(e) => handleChange({ successSub: e.target.value })}
              placeholder="A local expert will review your details and contact you within 24 hours."
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Fields */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Fields</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collectPhone">Collect Phone Number</Label>
              <p className="text-sm text-muted-foreground">Ask for phone in step 2</p>
            </div>
            <Switch
              id="collectPhone"
              checked={localSettings.collectPhone}
              onCheckedChange={(checked) => handleChange({ collectPhone: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collectPreferredContact">Collect Preferred Contact Method</Label>
              <p className="text-sm text-muted-foreground">Email, Phone, or WhatsApp</p>
            </div>
            <Switch
              id="collectPreferredContact"
              checked={localSettings.collectPreferredContact}
              onCheckedChange={(checked) => handleChange({ collectPreferredContact: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collectBestTime">Collect Best Time to Contact</Label>
              <p className="text-sm text-muted-foreground">Morning, Afternoon, or Evening</p>
            </div>
            <Switch
              id="collectBestTime"
              checked={localSettings.collectBestTime}
              onCheckedChange={(checked) => handleChange({ collectBestTime: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Privacy & Consent */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Consent</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="consentLabel">Consent Checkbox Label</Label>
            <Textarea
              id="consentLabel"
              value={localSettings.consentLabel}
              onChange={(e) => handleChange({ consentLabel: e.target.value })}
              placeholder="I agree to be contacted about my home valuation."
              rows={2}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to hide consent checkbox
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showPrivacyNote">Show Privacy Note</Label>
              <p className="text-sm text-muted-foreground">
                "We respect your privacy..."
              </p>
            </div>
            <Switch
              id="showPrivacyNote"
              checked={localSettings.showPrivacyNote}
              onCheckedChange={(checked) => handleChange({ showPrivacyNote: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="anchorId">Anchor ID</Label>
            <Input
              id="anchorId"
              value={localSettings.anchorId}
              onChange={(e) => handleChange({ anchorId: e.target.value })}
              placeholder="valuation"
            />
            <p className="text-sm text-muted-foreground mt-1">
              For smooth scrolling from Hero CTA (e.g., #valuation)
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>2-Step Wizard:</strong> Step 1 collects property info (address, type, beds, baths, etc.). Step 2 collects contact info. All submissions create a Lead with type: 'valuation'.
        </p>
      </div>
    </div>
  )
}
