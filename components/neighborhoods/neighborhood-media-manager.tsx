'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { VideoUpload } from '@/components/upload/video-upload'
import { ImageUpload } from '@/components/upload/image-upload'
import { Trash2, Star, StarOff, Video as VideoIcon, Image as ImageIcon, Loader2 } from 'lucide-react'
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
  thumbnailUrl?: string
  caption: string | null
  position: number
}

interface NeighborhoodMediaManagerProps {
  neighborhoodId: string
}

export function NeighborhoodMediaManager({ neighborhoodId }: NeighborhoodMediaManagerProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMedia()
    fetchNeighborhood()
  }, [neighborhoodId])

  const fetchNeighborhood = async () => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}`)
      if (response.ok) {
        const data = await response.json()
        // Get cover image URL and find matching media ID
        if (data.coverImageUrl) {
          const coverMedia = media.find(m => m.url === data.coverImageUrl)
          if (coverMedia) {
            setCoverMediaId(coverMedia.id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching neighborhood:', error)
    }
  }

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`)
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMedia(data.sort((a: Media, b: Media) => a.position - b.position))
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'Failed to load media',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = async (videoData: { 
    videoId: string
    thumbnailUrl: string
    streamUrl: string
    hlsUrl: string
    durationMinutes: number
  }) => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video',
          url: videoData.streamUrl,
          thumbnailUrl: videoData.thumbnailUrl,
          caption: null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add video')

      toast({
        title: 'Success',
        description: 'Video added successfully',
      })

      fetchMedia()
    } catch (error) {
      console.error('Error adding video:', error)
      toast({
        title: 'Error',
        description: 'Failed to add video',
      })
    }
  }

  const handleImageUpload = async (imageData: { url: string; fileId: string; filePath: string }) => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'photo',
          url: imageData.url,
          caption: null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add photo')

      toast({
        title: 'Success',
        description: 'Photo added successfully',
      })

      fetchMedia()
    } catch (error) {
      console.error('Error adding photo:', error)
      toast({
        title: 'Error',
        description: 'Failed to add photo',
      })
    }
  }

  const handleSetCover = async (mediaId: string, url: string) => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverImageUrl: url,
        }),
      })

      if (!response.ok) throw new Error('Failed to set cover')

      setCoverMediaId(mediaId)
      toast({
        title: 'Success',
        description: 'Cover image updated',
      })
    } catch (error) {
      console.error('Error setting cover:', error)
      toast({
        title: 'Error',
        description: 'Failed to set cover image',
      })
    }
  }

  const handleDelete = async () => {
    if (!mediaToDelete) return

    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media/${mediaToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete media')

      toast({
        title: 'Success',
        description: 'Media deleted',
      })

      fetchMedia()
      setDeleteDialogOpen(false)
      setMediaToDelete(null)
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete media',
      })
    }
  }

  const videos = media.filter(m => m.type === 'video')
  const photos = media.filter(m => m.type === 'photo')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <VideoIcon className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Videos</h3>
          <span className="text-sm text-muted-foreground">({videos.length})</span>
        </div>

        <VideoUpload
          onUploadComplete={handleVideoUpload}
          folder={`/neighborhoods/${neighborhoodId}`}
        />

        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {videos.map((video) => (
              <Card key={video.id} className="p-3">
                <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-2">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMediaToDelete(video)
                      setDeleteDialogOpen(true)
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Photos</h3>
          <span className="text-sm text-muted-foreground">({photos.length})</span>
        </div>

        <ImageUpload
          onUploadComplete={handleImageUpload}
          folder={`/neighborhoods/${neighborhoodId}`}
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="p-2">
                <div className="relative aspect-square bg-muted rounded-md overflow-hidden mb-2">
                  <img
                    src={photo.url}
                    alt="Neighborhood photo"
                    className="w-full h-full object-cover"
                  />
                  {coverMediaId === photo.id && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Cover
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={coverMediaId === photo.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetCover(photo.id, photo.url)}
                    className="flex-1"
                  >
                    {coverMediaId === photo.id ? (
                      <><StarOff className="w-3 h-3 mr-1" /> Cover</>
                    ) : (
                      <><Star className="w-3 h-3 mr-1" /> Set Cover</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMediaToDelete(photo)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {mediaToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
