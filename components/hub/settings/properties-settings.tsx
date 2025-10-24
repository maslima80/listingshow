'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PropertiesSettingsProps {
  settings: any
  onChange: (settings: any) => void
}

export function PropertiesSettings({ settings, onChange }: PropertiesSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Display Type</Label>
        <Select
          value={settings.displayType || 'grid'}
          onValueChange={(value) => updateSetting('displayType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Filter By</Label>
        <Select
          value={settings.propertyFilter || 'all'}
          onValueChange={(value) => updateSetting('propertyFilter', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            <SelectItem value="for_sale">For Sale</SelectItem>
            <SelectItem value="for_rent">For Rent</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Number of Properties to Show</Label>
        <Input
          type="number"
          min="1"
          max="20"
          value={settings.limit || 6}
          onChange={(e) => updateSetting('limit', parseInt(e.target.value))}
        />
      </div>

      {settings.displayType === 'grid' && (
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
      )}

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-status"
            checked={settings.showStatusBadge !== false}
            onCheckedChange={(checked) => updateSetting('showStatusBadge', checked)}
          />
          <Label htmlFor="show-status" className="cursor-pointer">
            Show Status Badges (For Sale, Sold, etc.)
          </Label>
        </div>

        {settings.displayType === 'carousel' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-rotate"
              checked={settings.autoRotate || false}
              onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
            />
            <Label htmlFor="auto-rotate" className="cursor-pointer">
              Auto-rotate Carousel
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}
