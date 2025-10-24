'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Upload, Video as VideoIcon, Image as ImageIcon, Star, X, Loader2 } from 'lucide-react'

interface Media {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnailUrl?: string
  caption: string | null
  position: number
  isExisting: boolean
}

interface MediaFile {
  id: string
  file?: File
  url: string
  preview: string
  thumbUrl?: string
  type: 'video' | 'photo'
  isCover: boolean
  isExisting: boolean
}

interface NeighborhoodMediaManagerProps {
  neighborhoodId: string
}

export function NeighborhoodMediaManager({ neighborhoodId }: NeighborhoodMediaManagerProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMedia()
  }, [neighborhoodId])

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media`)
      if (!response.ok) throw new Error('Failed to fetch media')
      
      const data = await response.json()
      
      // Get neighborhood to check cover image
      const neighborhoodResponse = await fetch(`/api/neighborhoods/${neighborhoodId}`)
      const neighborhood = await neighborhoodResponse.json()
      
      const existingMedia: MediaFile[] = data.map((m: any) => ({
        id: m.id,
        url: m.url,
        preview: m.thumbnailUrl || m.url,
        thumbUrl: m.thumbnailUrl,
        type: m.type,
        isCover: m.url === neighborhood.coverImageUrl,
        isExisting: true,
      }))
      
      setMediaFiles(existingMedia)
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

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const hasCover = mediaFiles.some(m => m.isCover)
    
    const newMediaFiles = files.map((file, index) => {
      const isVideo = file.type.startsWith('video/')
      const preview = URL.createObjectURL(file)
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: '',
        preview,
        type: isVideo ? 'video' : 'photo',
        isCover: !hasCover && !isVideo && index === 0,
        isExisting: false,
      } as MediaFile
    })
    
    setMediaFiles(prev => [...prev, ...newMediaFiles])
  }

  const setAsCover = async (id: string, url: string) => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImageUrl: url }),
      })

      if (!response.ok) throw new Error('Failed to set cover')

      setMediaFiles(prev =>
        prev.map(media => ({
          ...media,
          isCover: media.id === id,
        }))
      )

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

  const removeMedia = async (id: string) => {
    const media = mediaFiles.find(m => m.id === id)
    
    if (media?.isExisting) {
      try {
        const response = await fetch(`/api/neighborhoods/${neighborhoodId}/media/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to delete media')

        toast({
          title: 'Success',
          description: 'Media deleted',
        })
      } catch (error) {
        console.error('Error deleting media:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete media',
        })
        return
      }
    }
    
    setMediaFiles(prev => prev.filter(m => m.id !== id))
    
    // If removing cover, set first photo as cover
    if (media?.isCover) {
      const remaining = mediaFiles.filter(m => m.id !== id && m.type === 'photo')
      if (remaining.length > 0) {
        setAsCover(remaining[0].id, remaining[0].url)
      }
    }
  }

  const handleSaveMedia = async () => {
    const newFiles = mediaFiles.filter(m => !m.isExisting && m.file)
    
    if (newFiles.length === 0) {
      toast({
        title: 'No new files',
        description: 'All media is already uploaded',
      })
      return
    }

    setUploading(true)

    try {
      // Upload each file
      for (const mediaFile of newFiles) {
        if (!mediaFile.file) continue

        if (mediaFile.type === 'video') {
          // Upload video to Bunny.net
          const formData = new FormData()
          formData.append('file', mediaFile.file)
          formData.append('folder', `/neighborhoods/${neighborhoodId}`)

          const response = await fetch('/api/upload/video', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) throw new Error('Failed to upload video')

          const data = await response.json()

          // Add to database
          await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'video',
              url: data.streamUrl,
              thumbnailUrl: data.thumbnailUrl,
              caption: null,
            }),
          })
        } else {
          // Upload photo to ImageKit
          const formData = new FormData()
          formData.append('file', mediaFile.file)
          formData.append('folder', `/neighborhoods/${neighborhoodId}`)

          const response = await fetch('/api/upload/imagekit', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) throw new Error('Failed to upload photo')

          const data = await response.json()

          // Add to database
          await fetch(`/api/neighborhoods/${neighborhoodId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'photo',
              url: data.url,
              caption: null,
            }),
          })

          // If this is the cover, update neighborhood
          if (mediaFile.isCover) {
            await fetch(`/api/neighborhoods/${neighborhoodId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ coverImageUrl: data.url }),
            })
          }
        }
      }

      toast({
        title: 'Success',
        description: `Uploaded ${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'}`,
      })

      // Refresh media list
      await fetchMedia()
    } catch (error) {
      console.error('Error uploading media:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload some files',
      })
    } finally {
      setUploading(false)
    }
  }

  const videos = mediaFiles.filter(m => m.type === 'video')
  const photos = mediaFiles.filter(m => m.type === 'photo')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasNewFiles = mediaFiles.some(m => !m.isExisting)

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex gap-2">
        <div className="flex-1">
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
            <Button variant="outline" size="lg" className="w-full" asChild disabled={uploading}>
              <span className="cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                Add Photos & Videos
              </span>
            </Button>
          </label>
        </div>
        {hasNewFiles && (
          <Button 
            size="lg" 
            onClick={handleSaveMedia}
            disabled={uploading}
            className="min-w-[140px]"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Save Media
              </>
            )}
          </Button>
        )}
      </div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <VideoIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Videos</h3>
            <Badge variant="secondary">{videos.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map(media => (
              <div key={media.id} className="space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-border bg-black">
                  {media.thumbUrl ? (
                    <img
                      src={media.thumbUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMedia(media.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Video Icon */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      <VideoIcon className="w-3 h-3" />
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Section */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Photos</h3>
            <Badge variant="secondary">{photos.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(media => (
              <div key={media.id} className="space-y-2">
                <div
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    media.isCover ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <img
                    src={media.preview}
                    alt="Neighborhood"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!media.isCover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAsCover(media.id, media.url)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Cover
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMedia(media.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Cover Badge */}
                  {media.isCover && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Cover
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mediaFiles.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed rounded-lg">
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No media yet. Upload photos and videos to get started.</p>
        </div>
      )}
    </div>
  )
}
