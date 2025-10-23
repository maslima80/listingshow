'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Image as ImageIcon, Video as VideoIcon, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Media {
  id: string
  type: 'photo' | 'video'
  url: string
  caption: string | null
  position: number
}

interface MediaGalleryProps {
  neighborhoodId: string
}

export function MediaGallery({ neighborhoodId }: MediaGalleryProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCaption, setNewMediaCaption] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null)
  const { toast } = useToast()

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`)
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMedia(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'Failed to load media',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [neighborhoodId])

  const handleAddMedia = async () => {
    if (!newMediaUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'URL is required',
        variant: 'destructive',
      })
      return
    }

    setAdding(true)

    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newMediaType,
          url: newMediaUrl,
          caption: newMediaCaption || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add media')

      toast({
        title: 'Success',
        description: 'Media added successfully',
      })

      // Reset form
      setNewMediaUrl('')
      setNewMediaCaption('')
      setNewMediaType('photo')

      fetchMedia()
    } catch (error) {
      console.error('Error adding media:', error)
      toast({
        title: 'Error',
        description: 'Failed to add media',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return

    try {
      const response = await fetch(`/api/neighborhoods/media/${mediaToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete media')

      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      })

      fetchMedia()
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setMediaToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Media Form */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Add Media</h3>
        
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={newMediaType} onValueChange={(value: 'photo' | 'video') => setNewMediaType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Photo
                </div>
              </SelectItem>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" />
                  Video
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>URL *</Label>
          <Input
            value={newMediaUrl}
            onChange={(e) => setNewMediaUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>Caption (Optional)</Label>
          <Textarea
            value={newMediaCaption}
            onChange={(e) => setNewMediaCaption(e.target.value)}
            placeholder="Add a caption..."
            rows={2}
          />
        </div>

        <Button onClick={handleAddMedia} disabled={adding} className="w-full">
          {adding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </>
          )}
        </Button>
      </Card>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.caption || 'Neighborhood photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <VideoIcon className="w-12 h-12 text-white" />
                  </div>
                )}
                
                {/* Delete Button */}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setMediaToDelete(item)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {/* Type Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
                  {item.type === 'photo' ? (
                    <ImageIcon className="w-3 h-3" />
                  ) : (
                    <VideoIcon className="w-3 h-3" />
                  )}
                  {item.type}
                </div>
              </div>

              {item.caption && (
                <div className="p-2 text-xs text-muted-foreground line-clamp-2">
                  {item.caption}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {mediaToDelete?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedia} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
