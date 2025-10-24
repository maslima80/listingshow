'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NeighborhoodsSettingsProps {
  settings: any
  onChange: (settings: any) => void
}

export function NeighborhoodsSettings({ settings, onChange }: NeighborhoodsSettingsProps) {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  const fetchNeighborhoods = async () => {
    try {
      const res = await fetch('/api/neighborhoods')
      if (res.ok) {
        const data = await res.json()
        setNeighborhoods(data.filter((n: any) => n.isPublished))
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  const toggleNeighborhood = (id: string, checked: boolean) => {
    const current = settings.neighborhoodIds || []
    if (checked) {
      updateSetting('neighborhoodIds', [...current, id])
    } else {
      updateSetting('neighborhoodIds', current.filter((nid: string) => nid !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="border-b pb-6">
        <Label className="text-base mb-4 block">Section Title</Label>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Neighborhoods I Serve"
              value={settings.title || ''}
              onChange={(e) => updateSetting('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              placeholder="Discover the areas where I specialize"
              value={settings.subtitle || ''}
              onChange={(e) => updateSetting('subtitle', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hide-heading" className="font-normal">Hide Heading</Label>
            <Switch
              id="hide-heading"
              checked={settings.hideHeading || false}
              onCheckedChange={(checked) => updateSetting('hideHeading', checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Select Neighborhoods to Display</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Choose which neighborhoods to showcase (leave empty to show all published)
        </p>

        {neighborhoods.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 border rounded-md">
            No published neighborhoods found. Add neighborhoods in the Neighborhoods manager first.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {neighborhoods.map((neighborhood) => (
              <div key={neighborhood.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`neighborhood-${neighborhood.id}`}
                  checked={(settings.neighborhoodIds || []).includes(neighborhood.id)}
                  onCheckedChange={(checked) => toggleNeighborhood(neighborhood.id, checked as boolean)}
                />
                <Label htmlFor={`neighborhood-${neighborhood.id}`} className="cursor-pointer flex-1">
                  <div className="font-medium">{neighborhood.name}</div>
                  {neighborhood.tagline && (
                    <div className="text-xs text-muted-foreground">{neighborhood.tagline}</div>
                  )}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Display Type</Label>
        <Select
          value={settings.displayType || 'cards'}
          onValueChange={(value) => updateSetting('displayType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cards">Cards</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String(settings.columns || 3)}
          onValueChange={(value) => updateSetting('columns', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          placeholder="Explore Area"
          value={settings.ctaText || ''}
          onChange={(e) => updateSetting('ctaText', e.target.value)}
        />
      </div>
    </div>
  )
}
