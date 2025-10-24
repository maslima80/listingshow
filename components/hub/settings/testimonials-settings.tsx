'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TestimonialsSettingsProps {
  settings: any
  onChange: (settings: any) => void
}

export function TestimonialsSettings({ settings, onChange }: TestimonialsSettingsProps) {
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.filter((t: any) => t.status === 'approved'))
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  const toggleTestimonial = (id: string, checked: boolean) => {
    const current = Array.isArray(settings.testimonialIds) ? settings.testimonialIds : []
    if (checked) {
      updateSetting('testimonialIds', [...current, id])
    } else {
      updateSetting('testimonialIds', current.filter((tid: string) => tid !== id))
    }
  }

  const showAll = settings.testimonialIds === 'all' || !settings.testimonialIds

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
              placeholder="What Clients Say"
              value={settings.title || ''}
              onChange={(e) => updateSetting('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              placeholder="Real experiences from real people"
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
        <Label>Select Testimonials to Display</Label>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Choose specific testimonials or show all approved ones
        </p>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="show-all-testimonials"
            checked={showAll}
            onCheckedChange={(checked) => {
              if (checked) {
                updateSetting('testimonialIds', 'all')
              }
            }}
          />
          <Label htmlFor="show-all-testimonials" className="cursor-pointer">
            Show All Approved Testimonials
          </Label>
        </div>

        {testimonials.length > 0 && !showAll && (
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`testimonial-${testimonial.id}`}
                  checked={(settings.testimonialIds || []).includes(testimonial.id)}
                  onCheckedChange={(checked) => toggleTestimonial(testimonial.id, checked as boolean)}
                />
                <Label htmlFor={`testimonial-${testimonial.id}`} className="cursor-pointer flex-1">
                  <div className="font-medium">{testimonial.clientName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    "{testimonial.testimonialText.substring(0, 60)}..."
                  </div>
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Display Type</Label>
        <Select
          value={settings.displayType || 'carousel'}
          onValueChange={(value) => updateSetting('displayType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maximum Number to Show</Label>
        <Input
          type="number"
          min="1"
          max="50"
          value={settings.limit || 10}
          onChange={(e) => updateSetting('limit', parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-photos"
            checked={settings.showPhotos !== false}
            onCheckedChange={(checked) => updateSetting('showPhotos', checked)}
          />
          <Label htmlFor="show-photos" className="cursor-pointer">
            Show Client Photos
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-ratings"
            checked={settings.showRatings !== false}
            onCheckedChange={(checked) => updateSetting('showRatings', checked)}
          />
          <Label htmlFor="show-ratings" className="cursor-pointer">
            Show Star Ratings
          </Label>
        </div>

        {settings.displayType === 'carousel' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-rotate-testimonials"
              checked={settings.autoRotate !== false}
              onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
            />
            <Label htmlFor="auto-rotate-testimonials" className="cursor-pointer">
              Auto-rotate Carousel
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}
