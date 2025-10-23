'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Link as LinkIcon, Image as ImageIcon, Video, FileText, Upload, Loader2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Property {
  id: string
  title: string
  slug: string
  status: string
  coverAssetId?: string | null
}

interface MediaAsset {
  id: string
  propertyId: string
  type: 'photo' | 'video'
  url: string
  thumbUrl: string | null
  label: string | null
  position: number
}

interface PropertyWithMedia {
  id: string
  title: string
  slug: string
  media: MediaAsset[]
}

interface Block {
  id: string
  type: 'property' | 'link' | 'image' | 'video' | 'text'
  title?: string | null
  subtitle?: string | null
  url?: string | null
  mediaUrl?: string | null
  propertyId?: string | null
  position: number
  isVisible: boolean
}

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (blockData: any) => void
  onUpdate?: (blockId: string, blockData: any) => void
  editBlock?: Block | null
}

const blockTypes = [
  { value: 'property', label: 'Property', icon: Building2, description: 'Showcase a property listing' },
  { value: 'link', label: 'Link', icon: LinkIcon, description: 'Add a clickable link' },
  { value: 'text', label: 'Text', icon: FileText, description: 'Add a text block' },
  { value: 'image', label: 'Image', icon: ImageIcon, description: 'Upload an image' },
  { value: 'video', label: 'Video', icon: Video, description: 'Embed a video' },
]

export function AddBlockDialog({ open, onOpenChange, onAdd, onUpdate, editBlock }: AddBlockDialogProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<string>('')
  const [properties, setProperties] = useState<Property[]>([])
  const [propertiesWithMedia, setPropertiesWithMedia] = useState<PropertyWithMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    subtitle: '',
    url: '',
    mediaUrl: '',
    imageRatio: 'square', // square, portrait, landscape
    fullBleed: false,
  })

  // Initialize form with edit data
  useEffect(() => {
    if (editBlock) {
      setSelectedType(editBlock.type)
      setStep('details')
      
      let imageSettings = { ratio: 'square', fullBleed: false }
      if (editBlock.type === 'image' && editBlock.subtitle) {
        try {
          imageSettings = JSON.parse(editBlock.subtitle)
        } catch (e) {}
      }
      
      setFormData({
        propertyId: editBlock.propertyId || '',
        title: editBlock.title || '',
        subtitle: editBlock.type === 'image' ? '' : (editBlock.subtitle || ''),
        url: editBlock.url || '',
        mediaUrl: editBlock.mediaUrl || '',
        imageRatio: imageSettings.ratio || 'square',
        fullBleed: imageSettings.fullBleed || false,
      })
    }
  }, [editBlock])

  // Fetch published properties
  useEffect(() => {
    if (open && selectedType === 'property') {
      fetchProperties()
    }
  }, [open, selectedType])

  // Fetch property media for image/video blocks
  useEffect(() => {
    if (open && (selectedType === 'image' || selectedType === 'video')) {
      fetchPropertyMedia()
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
      setProperties([])
    }
  }

  const fetchPropertyMedia = async () => {
    try {
      const res = await fetch('/api/properties/media')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPropertiesWithMedia(data.propertiesWithMedia || [])
    } catch (error) {
      console.error('Error fetching property media:', error)
      setPropertiesWithMedia([])
    }
  }

  const handleSelectType = (type: string) => {
    setSelectedType(type)
    setStep('details')
  }

  const detectImageRatio = (width: number, height: number): string => {
    const ratio = width / height
    
    // Portrait (taller than wide) - 4:5 ratio or similar
    if (ratio < 0.95) return 'portrait'
    
    // Square (roughly 1:1)
    if (ratio >= 0.95 && ratio <= 1.05) return 'square'
    
    // Landscape (wider than tall) - 16:9 ratio or similar
    return 'landscape'
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // First, detect the image dimensions
      const img = new Image()
      const imageUrl = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // Auto-detect aspect ratio
      const detectedRatio = detectImageRatio(img.width, img.height)
      
      // Clean up
      URL.revokeObjectURL(imageUrl)

      // Upload to ImageKit
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', '/hub')

      const res = await fetch('/api/upload/imagekit', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await res.json()
      setFormData(prev => ({ 
        ...prev, 
        mediaUrl: data.url,
        imageRatio: detectedRatio // Auto-set the ratio
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
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
      blockData.subtitle = JSON.stringify({
        ratio: formData.imageRatio,
        fullBleed: formData.fullBleed
      })
    } else if (selectedType === 'video') {
      blockData.title = formData.title
      blockData.url = formData.url
    }

    if (editBlock && onUpdate) {
      onUpdate(editBlock.id, blockData)
    } else {
      onAdd(blockData)
    }
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
      imageRatio: 'square',
      fullBleed: false,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editBlock 
              ? `Edit ${blockTypes.find(t => t.value === selectedType)?.label}` 
              : step === 'type' 
                ? 'Add Block' 
                : `Add ${blockTypes.find(t => t.value === selectedType)?.label}`
            }
          </DialogTitle>
          <DialogDescription>
            {editBlock
              ? 'Update the details for your block'
              : step === 'type' 
                ? 'Choose the type of block you want to add to your hub'
                : 'Fill in the details for your block'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && !editBlock && (
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
                  {properties.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      No published properties found
                    </div>
                  ) : (
                    properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.title}
                      </SelectItem>
                    ))
                  )}
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
              <Label>Choose Image Source</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="mt-2 space-y-3">
                {formData.mediaUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border-2 border-slate-200">
                      <img 
                        src={formData.mediaUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                        className="flex-1"
                      >
                        {showMediaLibrary ? 'Hide' : 'From Property'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-32 border-2 border-dashed flex-col"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 mb-2 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mb-2" />
                          <span className="text-sm">Upload New</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                      className="h-32 border-2 border-dashed flex-col"
                    >
                      <Building2 className="h-5 w-5 mb-2" />
                      <span className="text-sm">From Property</span>
                    </Button>
                  </div>
                )}

                {/* Property Media Library */}
                {showMediaLibrary && (
                  <div className="border-2 border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-medium mb-3 text-sm">Select from your properties</h4>
                    {propertiesWithMedia.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No property photos found. Upload photos to your properties first.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {propertiesWithMedia.map((property) => (
                          <div key={property.id}>
                            <h5 className="font-medium text-xs text-slate-700 mb-2">{property.title}</h5>
                            <div className="grid grid-cols-3 gap-2">
                              {property.media
                                .filter(m => m.type === 'photo')
                                .map((media) => (
                                  <button
                                    key={media.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, mediaUrl: media.url }))
                                      setShowMediaLibrary(false)
                                      // Detect ratio from the image
                                      const img = new Image()
                                      img.onload = () => {
                                        const detectedRatio = detectImageRatio(img.width, img.height)
                                        setFormData(prev => ({ ...prev, imageRatio: detectedRatio }))
                                      }
                                      img.src = media.url
                                    }}
                                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-slate-900 transition-all"
                                  >
                                    <img
                                      src={media.thumbUrl || media.url}
                                      alt={media.label || 'Property photo'}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {formData.mediaUrl && (
              <>
                <div>
                  <Label>Image Ratio</Label>
                  <RadioGroup 
                    value={formData.imageRatio} 
                    onValueChange={(value) => setFormData({ ...formData, imageRatio: value })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="square" id="square" />
                      <Label htmlFor="square" className="cursor-pointer">Square (1:1)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="portrait" id="portrait" />
                      <Label htmlFor="portrait" className="cursor-pointer">Portrait (4:5)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landscape" id="landscape" />
                      <Label htmlFor="landscape" className="cursor-pointer">Landscape (16:9)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fullBleed"
                    checked={formData.fullBleed}
                    onChange={(e) => setFormData({ ...formData, fullBleed: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="fullBleed" className="cursor-pointer">
                    Full bleed (edge-to-edge for premium mobile look)
                  </Label>
                </div>
              </>
            )}
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
              <Label>Choose Video Source</Label>
              <div className="mt-2 space-y-3">
                {formData.url ? (
                  <div className="space-y-3">
                    <div className="p-4 border-2 border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-600 truncate">{formData.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, url: '' })}
                        className="flex-1"
                      >
                        Change Video
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                        className="flex-1"
                      >
                        {showMediaLibrary ? 'Hide' : 'From Property'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Input
                        type="url"
                        placeholder="YouTube or Vimeo URL"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">Paste external video URL</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                      className="h-full border-2 border-dashed flex-col"
                    >
                      <Building2 className="h-5 w-5 mb-2" />
                      <span className="text-sm">From Property</span>
                    </Button>
                  </div>
                )}

                {/* Property Video Library */}
                {showMediaLibrary && (
                  <div className="border-2 border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-medium mb-3 text-sm">Select from your properties</h4>
                    {propertiesWithMedia.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">
                        No property videos found. Upload videos to your properties first.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {propertiesWithMedia.map((property) => {
                          const videos = property.media.filter(m => m.type === 'video')
                          if (videos.length === 0) return null
                          
                          return (
                            <div key={property.id}>
                              <h5 className="font-medium text-xs text-slate-700 mb-2">{property.title}</h5>
                              <div className="grid grid-cols-2 gap-2">
                                {videos.map((media) => (
                                  <button
                                    key={media.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        url: media.url,
                                        mediaUrl: media.url,
                                        title: prev.title || media.label || 'Property Video'
                                      }))
                                      setShowMediaLibrary(false)
                                    }}
                                    className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200 hover:border-slate-900 transition-all group"
                                  >
                                    <img
                                      src={media.thumbUrl || '/placeholder.svg'}
                                      alt={media.label || 'Property video'}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                      <Video className="h-8 w-8 text-white" />
                                    </div>
                                    {media.label && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <p className="text-xs text-white truncate">{media.label}</p>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="flex gap-2 justify-end">
            {!editBlock && (
              <Button variant="outline" onClick={() => setStep('type')}>
                Back
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!isValid() || uploading}>
              {editBlock ? 'Update Block' : 'Add Block'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
