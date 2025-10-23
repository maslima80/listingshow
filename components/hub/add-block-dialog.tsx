'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Link as LinkIcon, Image, Video, FileText } from 'lucide-react'

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

const blockTypes = [
  { value: 'property', label: 'Property', icon: Building2, description: 'Showcase a property listing' },
  { value: 'link', label: 'Link', icon: LinkIcon, description: 'Add a clickable link' },
  { value: 'text', label: 'Text', icon: FileText, description: 'Add a text block' },
  { value: 'image', label: 'Image', icon: Image, description: 'Add an image' },
  { value: 'video', label: 'Video', icon: Video, description: 'Embed a video' },
]

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
    setStep('details')
  }

  const handleSubmit = () => {
    const blockData: any = { type: selectedType }

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'Add Block' : `Add ${blockTypes.find(t => t.value === selectedType)?.label}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'type' 
              ? 'Choose the type of block you want to add to your hub'
              : 'Fill in the details for your block'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="grid gap-3 py-4">
            {blockTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => handleSelectType(type.value)}
                  className="flex items-start gap-4 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{type.label}</h3>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </div>
                </button>
              )
            })}
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
