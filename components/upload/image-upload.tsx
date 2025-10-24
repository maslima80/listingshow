'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react'

interface ImageUploadProps {
  onUploadComplete: (imageData: {
    url: string
    fileId: string
    filePath: string
  }) => void
  folder?: string
  maxSizeMB?: number
  disabled?: boolean
  showPreview?: boolean
  currentImage?: string | null
  onRemove?: () => void
  multiple?: boolean
}

export function ImageUpload({
  onUploadComplete,
  folder = '/images',
  maxSizeMB = 10,
  disabled = false,
  showPreview = true,
  currentImage = null,
  onRemove,
  multiple = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Process multiple files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file`,
        })
        continue
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSizeMB) {
        toast({
          title: 'File too large',
          description: `${file.name} is ${fileSizeMB.toFixed(1)}MB. Maximum is ${maxSizeMB}MB`,
        })
        continue
      }

      // Show preview for single file mode
      if (showPreview && !multiple) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

      await uploadImage(file)
    }
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setProgress(0)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
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

        xhr.open('POST', '/api/upload/imagekit')
        xhr.send(formData)
      })

      const result = await uploadPromise

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      })

      onUploadComplete(result)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
      })
      setPreview(currentImage) // Revert preview on error
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {showPreview && preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!uploading && onRemove && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

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
            {preview ? 'Change Image' : 'Upload Image'}
          </>
        )}
      </Button>

      {uploading && (
        <Progress value={progress} />
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: {maxSizeMB}MB. Supported formats: JPG, PNG, WebP
      </p>
    </div>
  )
}
