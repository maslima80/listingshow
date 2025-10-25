'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, Link as LinkIcon, Image, Video, FileText, Sparkles, User, Home,
  MapPin, Star, DollarSign, Download, Phone, Share2, Minus
} from 'lucide-react'
import { BLOCK_METADATA, BLOCK_CATEGORIES } from '@/lib/types/hub-blocks'

interface Property {
  id: string
  title: string
  slug: string
  status: string
}

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (blockData: any) => void
}

const iconMap: Record<string, any> = {
  Sparkles, User, Home, MapPin, Star, FileText, DollarSign, Download, Phone, Share2,
  Building: Building2, Link: LinkIcon, Image, Video, Type: FileText, Minus
}

// Group blocks by category
const blocksByCategory = Object.values(BLOCK_METADATA).reduce((acc, block) => {
  if (!acc[block.category]) {
    acc[block.category] = []
  }
  acc[block.category].push(block)
  return acc
}, {} as Record<string, typeof BLOCK_METADATA[keyof typeof BLOCK_METADATA][]>)

export function AddBlockDialog({ open, onOpenChange, onAdd }: AddBlockDialogProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<string>('')
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    subtitle: '',
    url: '',
    mediaUrl: '',
  })

  // Fetch published properties
  useEffect(() => {
    if (open && selectedType === 'property') {
      fetchProperties()
    }
  }, [open, selectedType])

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties?status=published')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleSelectType = (type: string) => {
    setSelectedType(type)
    
    // Premium blocks don't need configuration - add immediately
    const premiumBlocks = ['hero', 'about', 'properties', 'neighborhoods', 'testimonials', 
                          'valuation', 'mortgage', 'lead_magnet', 'contact', 'social_footer']
    
    if (premiumBlocks.includes(type)) {
      onAdd({ type })
      handleClose()
    } else {
      setStep('details')
    }
  }

  const handleSubmit = () => {
    const blockData: any = { type: selectedType }

    // Legacy blocks need specific data
    if (selectedType === 'property') {
      blockData.propertyId = formData.propertyId
    } else if (selectedType === 'link') {
      blockData.title = formData.title
      blockData.url = formData.url
    } else if (selectedType === 'text') {
      blockData.title = formData.title
      blockData.subtitle = formData.subtitle
    } else if (selectedType === 'image') {
      blockData.title = formData.title
      blockData.mediaUrl = formData.mediaUrl
    } else if (selectedType === 'video') {
      blockData.title = formData.title
      blockData.url = formData.url
    }
    // Premium blocks (hero, about, properties, etc.) don't need config on creation
    // They pull data automatically from profile/managers

    onAdd(blockData)
    handleClose()
  }

  const handleClose = () => {
    setStep('type')
    setSelectedType('')
    setFormData({
      propertyId: '',
      title: '',
      subtitle: '',
      url: '',
      mediaUrl: '',
    })
    onOpenChange(false)
  }

  const isValid = () => {
    if (selectedType === 'property') return formData.propertyId
    if (selectedType === 'link') return formData.title && formData.url
    if (selectedType === 'text') return formData.title
    if (selectedType === 'image') return formData.mediaUrl
    if (selectedType === 'video') return formData.url
    return false
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'Add Block' : `Add ${BLOCK_METADATA[selectedType as keyof typeof BLOCK_METADATA]?.label}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'type' 
              ? 'Choose the type of block you want to add to your hub'
              : 'Fill in the details for your block'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="space-y-6 py-4">
            {Object.entries(blocksByCategory).map(([category, blocks]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {BLOCK_CATEGORIES[category as keyof typeof BLOCK_CATEGORIES]}
                </h3>
                <div className="grid gap-2">
                  {blocks.map((block) => {
                    const Icon = iconMap[block.icon] || FileText
                    return (
                      <button
                        key={block.type}
                        onClick={() => handleSelectType(block.type)}
                        className="flex items-start gap-3 p-3 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-0.5">{block.label}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{block.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'details' && selectedType === 'property' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Property</Label>
              <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 'details' && selectedType === 'link' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Link Title</Label>
              <Input
                placeholder="e.g., View Our Portfolio"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 'details' && selectedType === 'text' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="e.g., About Us"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                placeholder="Write your text here..."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 'details' && selectedType === 'image' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Image Title (optional)</Label>
              <Input
                placeholder="e.g., Team Photo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 'details' && selectedType === 'video' && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Video Title</Label>
              <Input
                placeholder="e.g., Company Overview"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                type="url"
                placeholder="YouTube or Vimeo URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Supports YouTube and Vimeo</p>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setStep('type')}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid()}>
              Add Block
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
