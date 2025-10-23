'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, Video, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VideoUploadProps {
  onUploadComplete: (videoData: {
    videoId: string
    thumbnailUrl: string
    streamUrl: string
    hlsUrl: string
    durationMinutes: number
  }) => void
  folder?: string
  maxSizeMB?: number
  disabled?: boolean
}

export function VideoUpload({
  onUploadComplete,
  folder = '/videos',
  maxSizeMB = 500,
  disabled = false,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const checkQuota = async () => {
    try {
      const response = await fetch('/api/video-quota')
      if (!response.ok) throw new Error('Failed to check quota')
      const data = await response.json()
      
      if (data.percentage >= 90) {
        setQuotaWarning(`⚠️ Low quota: ${data.remaining} minutes remaining`)
      } else {
        setQuotaWarning(null)
      }
      
      return data
    } catch (error) {
      console.error('Error checking quota:', error)
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file',
      })
      return
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSizeMB}MB. Your file is ${fileSizeMB.toFixed(1)}MB`,
      })
      return
    }

    // Check quota before upload
    const quota = await checkQuota()
    if (quota && quota.remaining <= 0) {
      toast({
        title: 'Quota exceeded',
        description: 'You have no video minutes remaining. Please upgrade your plan.',
      })
      return
    }

    await uploadVideo(file)
  }

  const uploadVideo = async (file: File) => {
    setUploading(true)
    setProgress(0)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', file.name)
      formData.append('folder', folder)

      // Upload with progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setProgress(percentComplete)
        }
      })

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(xhr.statusText))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('POST', '/api/upload/video')
        xhr.send(formData)
      })

      const result = await uploadPromise

      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      })

      onUploadComplete(result)

      // Refresh quota
      await checkQuota()

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload video',
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {quotaWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{quotaWarning}</AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full"
        variant="outline"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading... {progress}%
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </>
        )}
      </Button>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-center text-muted-foreground">
            {progress < 100 ? 'Uploading...' : 'Processing video...'}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: {maxSizeMB}MB. Supported formats: MP4, MOV, AVI, WebM
      </p>
    </div>
  )
}
