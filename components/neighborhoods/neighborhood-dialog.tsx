'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import { MediaGallery } from './media-gallery'

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
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [heroVideoUrl, setHeroVideoUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (neighborhood) {
      setName(neighborhood.name)
      setSlug(neighborhood.slug)
      setTagline(neighborhood.tagline || '')
      setDescription(neighborhood.description || '')
      setCoverImageUrl(neighborhood.coverImageUrl || '')
      setHeroVideoUrl(neighborhood.heroVideoUrl || '')
      setIsPublished(neighborhood.isPublished)
    } else {
      // Reset form
      setName('')
      setSlug('')
      setTagline('')
      setDescription('')
      setCoverImageUrl('')
      setHeroVideoUrl('')
      setIsPublished(false)
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
        variant: 'destructive',
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
          coverImageUrl: coverImageUrl || null,
          heroVideoUrl: heroVideoUrl || null,
          isPublished,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save neighborhood')
      }

      toast({
        title: 'Success',
        description: `Neighborhood ${neighborhood ? 'updated' : 'created'} successfully`,
      })

      onSave()
    } catch (error: any) {
      console.error('Error saving neighborhood:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save neighborhood',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {neighborhood ? 'Edit Neighborhood' : 'Add Neighborhood'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media" disabled={!neighborhood}>
              Media {!neighborhood && '(Save first)'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
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

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="coverImage"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {coverImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCoverImageUrl('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {coverImageUrl && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Hero Video */}
            <div className="space-y-2">
              <Label htmlFor="heroVideo">Hero Video URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="heroVideo"
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/... or video URL"
                />
                {heroVideoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setHeroVideoUrl('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="published" className="text-base">Publish Neighborhood</Label>
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
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            {neighborhood && (
              <MediaGallery neighborhoodId={neighborhood.id} />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {neighborhood ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
