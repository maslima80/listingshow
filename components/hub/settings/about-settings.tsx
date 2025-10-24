'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AboutSettingsProps {
  settings: any
  onChange: (settings: any) => void
}

export function AboutSettings({ settings, onChange }: AboutSettingsProps) {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  const toggleProfileField = (field: string, checked: boolean) => {
    if (checked && profile) {
      updateSetting(field, profile[field])
    } else {
      const newSettings = { ...settings }
      delete newSettings[field]
      onChange(newSettings)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Profile Information to Show</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select which information from your profile to display
        </p>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-photo"
              checked={settings.photoUrl !== undefined}
              onCheckedChange={(checked) => toggleProfileField('photoUrl', checked as boolean)}
            />
            <Label htmlFor="show-photo" className="cursor-pointer">
              Profile Photo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-bio-short"
              checked={settings.bioShort !== undefined}
              onCheckedChange={(checked) => toggleProfileField('bioShort', checked as boolean)}
            />
            <Label htmlFor="show-bio-short" className="cursor-pointer">
              Short Bio
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-bio-long"
              checked={settings.bioLong !== undefined}
              onCheckedChange={(checked) => toggleProfileField('bioLong', checked as boolean)}
            />
            <Label htmlFor="show-bio-long" className="cursor-pointer">
              Extended Bio
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-video"
              checked={settings.videoUrl !== undefined}
              onCheckedChange={(checked) => toggleProfileField('videoUrl', checked as boolean)}
            />
            <Label htmlFor="show-video" className="cursor-pointer">
              Video Introduction
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-stats"
              checked={settings.showStats || false}
              onCheckedChange={(checked) => updateSetting('showStats', checked)}
            />
            <Label htmlFor="show-stats" className="cursor-pointer">
              Show Stats (Years, Homes Sold, Volume)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-credentials"
              checked={settings.showCredentials || false}
              onCheckedChange={(checked) => updateSetting('showCredentials', checked)}
            />
            <Label htmlFor="show-credentials" className="cursor-pointer">
              Show Credentials & Awards
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          value={settings.layout || 'left'}
          onValueChange={(value) => updateSetting('layout', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Photo Left, Text Right</SelectItem>
            <SelectItem value="right">Photo Right, Text Left</SelectItem>
            <SelectItem value="center">Centered</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
