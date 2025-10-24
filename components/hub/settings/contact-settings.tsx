'use client'

import { useState } from 'react'
import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

  const handleActionsChange = (key: keyof ContactBlockSettings['actions'], value: boolean) => {
    handleChange({
      actions: {
        ...localSettings.actions,
        [key]: value,
      },
    })
  }

  const handleLabelsChange = (key: keyof ContactBlockSettings['labels'], value: string) => {
    handleChange({
      labels: {
        ...localSettings.labels,
        [key]: value,
      },
    })
  }

  const handleFormChange = (key: keyof ContactBlockSettings['form'], value: any) => {
    handleChange({
      form: {
        ...localSettings.form,
        [key]: value,
      },
    })
  }

  const handleScheduleChange = (key: keyof ContactBlockSettings['schedule'], value: any) => {
    handleChange({
      schedule: {
        ...localSettings.schedule,
        [key]: value,
      },
    })
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
              placeholder="Interested in working together?"
            />
          </div>

          <div>
            <Label htmlFor="subline">Subline</Label>
            <Input
              id="subline"
              value={localSettings.subline}
              onChange={(e) => handleChange({ subline: e.target.value })}
              placeholder="Schedule a tour or ask a question."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hideHeading">Hide Heading</Label>
            <Switch
              id="hideHeading"
              checked={localSettings.hideHeading || false}
              onCheckedChange={(checked) => handleChange({ hideHeading: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Layout</h3>
        <Select
          value={localSettings.layout}
          onValueChange={(value: 'buttons' | 'form' | 'buttons_form') => handleChange({ layout: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buttons">Buttons Only</SelectItem>
            <SelectItem value="form">Form Only</SelectItem>
            <SelectItem value="buttons_form">Buttons + Form</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          Choose how visitors can contact you
        </p>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showEmail">Show Email Button</Label>
            <Switch
              id="showEmail"
              checked={localSettings.actions.showEmail}
              onCheckedChange={(checked) => handleActionsChange('showEmail', checked)}
            />
          </div>

          {localSettings.actions.showEmail && (
            <div>
              <Label htmlFor="emailLabel">Email Button Label</Label>
              <Input
                id="emailLabel"
                value={localSettings.labels.email}
                onChange={(e) => handleLabelsChange('email', e.target.value)}
                placeholder="Send Email"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="showCall">Show Call Button</Label>
            <Switch
              id="showCall"
              checked={localSettings.actions.showCall}
              onCheckedChange={(checked) => handleActionsChange('showCall', checked)}
            />
          </div>

          {localSettings.actions.showCall && (
            <div>
              <Label htmlFor="callLabel">Call Button Label</Label>
              <Input
                id="callLabel"
                value={localSettings.labels.call}
                onChange={(e) => handleLabelsChange('call', e.target.value)}
                placeholder="Call"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="showSchedule">Show Schedule Button</Label>
            <Switch
              id="showSchedule"
              checked={localSettings.actions.showSchedule}
              onCheckedChange={(checked) => handleActionsChange('showSchedule', checked)}
            />
          </div>

          {localSettings.actions.showSchedule && (
            <div>
              <Label htmlFor="scheduleLabel">Schedule Button Label</Label>
              <Input
                id="scheduleLabel"
                value={localSettings.labels.schedule}
                onChange={(e) => handleLabelsChange('schedule', e.target.value)}
                placeholder="Schedule a Visit"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="showWhatsapp">Show WhatsApp Button</Label>
            <Switch
              id="showWhatsapp"
              checked={localSettings.actions.showWhatsapp}
              onCheckedChange={(checked) => handleActionsChange('showWhatsapp', checked)}
            />
          </div>

          {localSettings.actions.showWhatsapp && (
            <div>
              <Label htmlFor="whatsappLabel">WhatsApp Button Label</Label>
              <Input
                id="whatsappLabel"
                value={localSettings.labels.whatsapp}
                onChange={(e) => handleLabelsChange('whatsapp', e.target.value)}
                placeholder="WhatsApp"
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Form Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Form Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showForm">Show Form</Label>
            <Switch
              id="showForm"
              checked={localSettings.form.show}
              onCheckedChange={(checked) => handleFormChange('show', checked)}
            />
          </div>

          {localSettings.form.show && (
            <>
              <div>
                <Label htmlFor="formMode">Form Mode</Label>
                <Select
                  value={localSettings.form.mode}
                  onValueChange={(value: 'modal' | 'inline') => handleFormChange('mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modal">Modal (Popup)</SelectItem>
                    <SelectItem value="inline">Inline (On Page)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requirePhone">Require Phone Number</Label>
                <Switch
                  id="requirePhone"
                  checked={localSettings.form.requirePhone}
                  onCheckedChange={(checked) => handleFormChange('requirePhone', checked)}
                />
              </div>

              <div>
                <Label htmlFor="messagePlaceholder">Message Placeholder</Label>
                <Input
                  id="messagePlaceholder"
                  value={localSettings.form.messagePlaceholder}
                  onChange={(e) => handleFormChange('messagePlaceholder', e.target.value)}
                  placeholder="I'm interested in this…"
                />
              </div>

              <div>
                <Label htmlFor="consentLabel">Consent Label (optional)</Label>
                <Textarea
                  id="consentLabel"
                  value={localSettings.form.consentLabel || ''}
                  onChange={(e) => handleFormChange('consentLabel', e.target.value)}
                  placeholder="I agree to be contacted about real estate opportunities."
                  rows={2}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty to hide consent checkbox
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Scheduling Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Scheduling Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="scheduleEnabled">Enable Scheduling</Label>
            <Switch
              id="scheduleEnabled"
              checked={localSettings.schedule.enabled}
              onCheckedChange={(checked) => handleScheduleChange('enabled', checked)}
            />
          </div>

          {localSettings.schedule.enabled && (
            <>
              <div>
                <Label htmlFor="scheduleTitle">Modal Title</Label>
                <Input
                  id="scheduleTitle"
                  value={localSettings.schedule.title}
                  onChange={(e) => handleScheduleChange('title', e.target.value)}
                  placeholder="Request a time"
                />
              </div>

              <div>
                <Label htmlFor="dateLabel">Date Field Label</Label>
                <Input
                  id="dateLabel"
                  value={localSettings.schedule.dateLabel}
                  onChange={(e) => handleScheduleChange('dateLabel', e.target.value)}
                  placeholder="Preferred date"
                />
              </div>

              <div>
                <Label htmlFor="noteLabel">Notes Field Label</Label>
                <Input
                  id="noteLabel"
                  value={localSettings.schedule.noteLabel}
                  onChange={(e) => handleScheduleChange('noteLabel', e.target.value)}
                  placeholder="Anything we should know?"
                />
              </div>

              <div>
                <Label>Time Windows</Label>
                <div className="space-y-2 mt-2">
                  {localSettings.schedule.timeWindows.map((window, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={window}
                        onChange={(e) => {
                          const newWindows = [...localSettings.schedule.timeWindows]
                          newWindows[index] = e.target.value
                          handleScheduleChange('timeWindows', newWindows)
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWindows = localSettings.schedule.timeWindows.filter((_, i) => i !== index)
                          handleScheduleChange('timeWindows', newWindows)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleScheduleChange('timeWindows', [...localSettings.schedule.timeWindows, 'New Window'])
                    }}
                  >
                    Add Time Window
                  </Button>
                </div>
              </div>
            </>
          )}
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
    </div>
  )
}
