'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'
import { NeighborhoodMediaManager } from './neighborhood-media-manager'

interface Neighborhood {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  coverImageUrl: string | null
  heroVideoUrl: string | null
  isPublished: boolean
}

interface NeighborhoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  neighborhood: Neighborhood | null
  onSave: () => void
}

export function NeighborhoodDialog({ open, onOpenChange, neighborhood, onSave }: NeighborhoodDialogProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [neighborhoodId, setNeighborhoodId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (neighborhood) {
      setName(neighborhood.name)
      setSlug(neighborhood.slug)
      setTagline(neighborhood.tagline || '')
      setDescription(neighborhood.description || '')
      setIsPublished(neighborhood.isPublished)
      setNeighborhoodId(neighborhood.id)
      setActiveTab('details')
    } else {
      // Reset form
      setName('')
      setSlug('')
      setTagline('')
      setDescription('')
      setIsPublished(false)
      setNeighborhoodId(null)
      setActiveTab('details')
    }
  }, [neighborhood, open])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!neighborhood) {
      // Auto-generate slug only for new neighborhoods
      setSlug(generateSlug(value))
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required',
      })
      return
    }

    setLoading(true)

    try {
      const url = neighborhood
        ? `/api/neighborhoods/${neighborhood.id}`
        : '/api/neighborhoods'
      
      const method = neighborhood ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          tagline: tagline || null,
          description: description || null,
          isPublished,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save neighborhood')
      }

      const savedNeighborhood = await response.json()
      
      toast({
        title: 'Success',
        description: `Neighborhood ${neighborhood ? 'updated' : 'created'} successfully`,
      })

      // If new neighborhood, set ID and switch to media tab
      if (!neighborhood) {
        setNeighborhoodId(savedNeighborhood.id)
        setActiveTab('media')
        toast({
          title: 'Next Step',
          description: 'Now add photos and videos to your neighborhood',
        })
      } else {
        onSave()
        onOpenChange(false)
      }
    } catch (error: any) {
      console.error('Error saving neighborhood:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save neighborhood',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (neighborhoodId && !neighborhood) {
      // New neighborhood was created, refresh list
      onSave()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {neighborhood ? 'Edit Neighborhood' : 'Add Neighborhood'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media" disabled={!neighborhoodId}>
              Media {!neighborhoodId && '(Save first)'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Coral Gables"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="coral-gables"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (lowercase, no spaces)
              </p>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Historic charm meets modern luxury"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell visitors about this neighborhood..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                500-1000 characters recommended
              </p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="published" className="text-base font-medium">Publish Neighborhood</Label>
                <p className="text-sm text-muted-foreground">
                  Make this neighborhood visible on your Hub
                </p>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                {neighborhood ? 'Update' : 'Create'} & Continue
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="flex-1 overflow-y-auto mt-4">
            {neighborhoodId ? (
              <NeighborhoodMediaManager neighborhoodId={neighborhoodId} />
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                Save the neighborhood details first to add media
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
