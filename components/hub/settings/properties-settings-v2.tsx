'use client'

import { useState, useEffect } from 'react'
import { PropertiesBlockSettings } from '@/lib/types/hub-blocks'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { X, Plus, Search, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface PropertiesSettingsV2Props {
  settings: PropertiesBlockSettings
  onChange: (settings: PropertiesBlockSettings) => void
}

interface Property {
  id: string
  title: string
  slug: string
  coverImageUrl?: string
  status: string
  location: string
}

export function PropertiesSettingsV2({ settings, onChange }: PropertiesSettingsV2Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Safe defaults
  const safeSettings: PropertiesBlockSettings = {
    propertyIds: settings?.propertyIds || [],
    layout: settings?.layout || 'auto',
    max: settings?.max || 6,
    show: settings?.show || {
      price: true,
      badges: true,
      location: true,
      bedsBaths: true,
      cta: true,
    },
    ctaLabel: settings?.ctaLabel || 'View Property',
    title: settings?.title || 'Featured Properties',
    subtitle: settings?.subtitle || 'Explore my latest listings',
    hideHeading: settings?.hideHeading || false,
  }

  // Fetch user's properties
  useEffect(() => {
    if (selectorOpen) {
      setLoading(true)
      fetch('/api/properties?status=published')
        .then(res => res.json())
        .then(data => {
          setProperties(data.properties || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch properties:', err)
          setLoading(false)
        })
    }
  }, [selectorOpen])

  // Fetch selected properties details
  useEffect(() => {
    if (safeSettings.propertyIds.length > 0) {
      fetch(`/api/properties?ids=${safeSettings.propertyIds.join(',')}`)
        .then(res => res.json())
        .then(data => {
          setSelectedProperties(data.properties || [])
        })
        .catch(err => console.error('Failed to fetch selected properties:', err))
    } else {
      setSelectedProperties([])
    }
  }, [safeSettings.propertyIds.join(',')])

  const updateSetting = <K extends keyof PropertiesBlockSettings>(
    key: K,
    value: PropertiesBlockSettings[K]
  ) => {
    onChange({ ...safeSettings, [key]: value })
  }

  const updateShow = (field: keyof PropertiesBlockSettings['show'], value: boolean) => {
    onChange({
      ...safeSettings,
      show: {
        ...safeSettings.show,
        [field]: value,
      },
    })
  }

  const toggleProperty = (propertyId: string) => {
    const newIds = safeSettings.propertyIds.includes(propertyId)
      ? safeSettings.propertyIds.filter(id => id !== propertyId)
      : [...safeSettings.propertyIds, propertyId]
    updateSetting('propertyIds', newIds)
  }

  const removeProperty = (propertyId: string) => {
    updateSetting('propertyIds', safeSettings.propertyIds.filter(id => id !== propertyId))
  }

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Selected Properties</Label>
            <p className="text-xs text-muted-foreground">
              Choose which properties to showcase
            </p>
          </div>
          <Badge variant="secondary">
            {safeSettings.propertyIds.length} selected
          </Badge>
        </div>

        {/* Selected Properties List */}
        {selectedProperties.length > 0 && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            {selectedProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-3 p-2 bg-background rounded border"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                {property.coverImageUrl && (
                  <img
                    src={property.coverImageUrl}
                    alt={property.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{property.location}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProperty(property.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Select Properties Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSelectorOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {safeSettings.propertyIds.length === 0 ? 'Select Properties' : 'Add More Properties'}
        </Button>

        {/* Add New Property Link */}
        <Link href="/dashboard/properties/new" target="_blank">
          <Button variant="link" className="w-full text-xs">
            + Add new property
          </Button>
        </Link>
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
            <SelectItem value="auto">Auto (Recommended)</SelectItem>
            <SelectItem value="hero">Hero (Full Width)</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Auto: 1 property = Hero, 2-6 = Grid, 6+ = Carousel
        </p>
      </div>

      {/* Max Properties */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Max Properties to Show</Label>
          <span className="text-sm font-medium">{safeSettings.max}</span>
        </div>
        <Slider
          value={[safeSettings.max]}
          onValueChange={(value) => updateSetting('max', value[0])}
          min={1}
          max={6}
          step={1}
          className="w-full"
        />
      </div>

      {/* What to Show */}
      <div className="border-t pt-6">
        <Label className="text-base mb-4 block">What to Show</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-price" className="font-normal">Price</Label>
            <Switch
              id="show-price"
              checked={safeSettings.show.price}
              onCheckedChange={(checked) => updateShow('price', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-badges" className="font-normal">Status Badges</Label>
            <Switch
              id="show-badges"
              checked={safeSettings.show.badges}
              onCheckedChange={(checked) => updateShow('badges', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-location" className="font-normal">Location</Label>
            <Switch
              id="show-location"
              checked={safeSettings.show.location}
              onCheckedChange={(checked) => updateShow('location', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-beds-baths" className="font-normal">Beds & Baths</Label>
            <Switch
              id="show-beds-baths"
              checked={safeSettings.show.bedsBaths}
              onCheckedChange={(checked) => updateShow('bedsBaths', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-cta" className="font-normal">CTA Button</Label>
            <Switch
              id="show-cta"
              checked={safeSettings.show.cta}
              onCheckedChange={(checked) => updateShow('cta', checked)}
            />
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="border-t pt-6">
        <Label className="text-base mb-4 block">Section Title</Label>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Featured Properties"
              value={safeSettings.title}
              onChange={(e) => updateSetting('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              placeholder="Explore my latest listings"
              value={safeSettings.subtitle}
              onChange={(e) => updateSetting('subtitle', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hide-heading" className="font-normal">Hide Heading</Label>
            <Switch
              id="hide-heading"
              checked={safeSettings.hideHeading}
              onCheckedChange={(checked) => updateSetting('hideHeading', checked)}
            />
          </div>
        </div>
      </div>

      {/* CTA Label */}
      <div className="border-t pt-6">
        <Label className="text-base mb-3 block">CTA Button</Label>
        <div className="space-y-2">
          <Label htmlFor="cta-label">Button Text</Label>
          <Input
            id="cta-label"
            placeholder="View Property"
            value={safeSettings.ctaLabel}
            onChange={(e) => updateSetting('ctaLabel', e.target.value)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-1">Card Aspect Ratio</p>
        <p className="text-muted-foreground">
          Square (1:1) layout adapts perfectly to both portrait and landscape photos.
        </p>
      </div>

      {/* Property Selector Modal */}
      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Properties</DialogTitle>
            <DialogDescription>
              Choose which properties to showcase in this section
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading properties...
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No properties found
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = safeSettings.propertyIds.includes(property.id)
                return (
                  <div
                    key={property.id}
                    onClick={() => toggleProperty(property.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {property.coverImageUrl && (
                      <img
                        src={property.coverImageUrl}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {property.status}
                      </Badge>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {safeSettings.propertyIds.length} selected
            </p>
            <Button onClick={() => setSelectorOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
