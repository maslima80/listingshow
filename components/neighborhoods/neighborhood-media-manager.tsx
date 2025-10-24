'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Image as ImageIcon, Video as VideoIcon, Loader2, Upload } from 'lucide-react'
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
  thumbUrl: string | null
  caption: string | null
  position: number
  provider: string | null
  providerId: string | null
  durationSec: number | null
}

interface NeighborhoodMediaManagerProps {
  neighborhoodId: string
}

export function NeighborhoodMediaManager({ neighborhoodId }: NeighborhoodMediaManagerProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')

      if (!isVideo && !isImage) {
        console.warn(`Skipping unsupported file: ${file.name}`)
        continue
      }

      try {
        if (isVideo) {
          // Upload video to Bunny
          const formData = new FormData()
          formData.append('video', file)
          formData.append('title', file.name)
          formData.append('folder', '/neighborhoods')

          const uploadResponse = await fetch('/api/upload/video', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) throw new Error('Failed to upload video')
          const videoData = await uploadResponse.json()

          // Save to database
          const saveResponse = await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'video',
              url: videoData.hlsUrl,
              thumbUrl: videoData.thumbnailUrl,
              provider: 'bunny',
              providerId: videoData.videoId,
              durationSec: videoData.durationSeconds || 0,
              caption: null,
            }),
          })

          if (!saveResponse.ok) throw new Error('Failed to save video')
          successCount++
        } else {
          // Upload image to ImageKit
          const formData = new FormData()
          formData.append('file', file)
          formData.append('fileName', file.name)
          formData.append('folder', '/neighborhoods')

          const uploadResponse = await fetch('/api/upload/imagekit', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) throw new Error('Failed to upload image')
          const imageData = await uploadResponse.json()

          // Save to database
          const saveResponse = await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'photo',
              url: imageData.url,
              provider: 'imagekit',
              providerId: imageData.fileId,
              caption: null,
            }),
          })

          if (!saveResponse.ok) throw new Error('Failed to save image')
          successCount++
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        errorCount++
      }
    }

    // Show result toast
    if (successCount > 0) {
      toast({
        title: 'Success',
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      })
    } else if (errorCount > 0) {
      toast({
        title: 'Error',
        description: `Failed to upload ${errorCount} file(s)`,
      })
    }

    // Refresh media list
    fetchMedia()
    setUploading(false)

    // Reset input
    e.target.value = ''
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

  const videos = media.filter(m => m.type === 'video')
  const photos = media.filter(m => m.type === 'photo')

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add Media</h3>
        </div>

        <div>
          <input
            type="file"
            id="media-upload"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="media-upload">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Photos & Videos
                  </>
                )}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Select multiple files at once - we'll handle photos and videos automatically
          </p>
        </div>
      </Card>

      {/* Videos Section - Show First (Video-First Platform) */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <VideoIcon className="w-5 h-5" />
            Videos ({videos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-[2/3] bg-black rounded-lg overflow-hidden">
                  {item.thumbUrl ? (
                    <img
                      src={item.thumbUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon className="w-12 h-12 text-white/50" />
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

                  {/* Duration Badge */}
                  {item.durationSec && item.durationSec > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                      {Math.floor(item.durationSec / 60)}:{String(item.durationSec % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Photos Section */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={item.url}
                    alt={item.caption || 'Neighborhood photo'}
                    className="w-full h-full object-cover"
                  />
                  
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
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No media added yet</p>
          <p className="text-sm">Upload videos and photos to showcase this neighborhood</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {mediaToDelete?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {mediaToDelete?.type}? This will also remove it from {mediaToDelete?.provider} storage. This action cannot be undone.
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
