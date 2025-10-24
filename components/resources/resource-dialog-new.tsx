'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Resource {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  fileUrl: string
  fileSize: number | null
  isActive: boolean
}

interface ResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: Resource | null
  onSave: () => void
}

export function ResourceDialog({ open, onOpenChange, resource, onSave }: ResourceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileName, setFileName] = useState('')
  const [isActive, setIsActive] = useState(true)
  
  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const coverInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (resource) {
      setTitle(resource.title)
      setDescription(resource.description || '')
      setCoverImageUrl(resource.coverImageUrl || '')
      setFileUrl(resource.fileUrl)
      setFileSize(resource.fileSize || 0)
      setFileName(resource.fileUrl.split('/').pop() || '')
      setIsActive(resource.isActive)
    } else {
      // Reset form
      setTitle('')
      setDescription('')
      setCoverImageUrl('')
      setFileUrl('')
      setFileSize(0)
      setFileName('')
      setIsActive(true)
    }
  }, [resource, open])

  // Upload cover image to ImageKit
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Cover image must be under 5MB',
      })
      return
    }

    setUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setCoverImageUrl(data.url)

      toast({
        title: 'Success',
        description: 'Cover image uploaded',
      })
    } catch (error) {
      console.error('Error uploading cover:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload cover image',
      })
    } finally {
      setUploadingCover(false)
    }
  }

  // Upload file (PDF/ZIP) - using ImageKit which supports non-image files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF and ZIP files are allowed',
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'File must be under 50MB',
      })
      return
    }

    setUploadingFile(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Upload failed'))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('POST', '/api/upload/file')
        xhr.send(formData)
      })

      const data: any = await uploadPromise
      setFileUrl(data.url)
      setFileName(file.name)
      setFileSize(file.size)

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file',
      })
    } finally {
      setUploadingFile(false)
      setUploadProgress(0)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and file are required',
      })
      return
    }

    setLoading(true)

    try {
      const url = resource
        ? `/api/resources/${resource.id}`
        : '/api/resources'
      
      const method = resource ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          coverImageUrl: coverImageUrl || null,
          fileUrl,
          fileSize: fileSize || null,
          isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save resource')
      }

      toast({
        title: 'Success',
        description: `Resource ${resource ? 'updated' : 'created'} successfully`,
      })

      onSave()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving resource:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save resource',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Resource' : 'Add Resource / Lead Magnet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Resource Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., First-Time Home Buyer's Guide"
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this resource offers..."
              rows={3}
            />
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {coverImageUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCoverImageUrl('')}
                      disabled={uploadingCover}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Cover Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG up to 5MB • Recommended: 1200x630px
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File to Download *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center border-primary/50 bg-primary/5">
              {fileUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1 text-left">
                      <p className="font-medium truncate">{fileName}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
                    </div>
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change File
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFileUrl('')
                        setFileName('')
                        setFileSize(0)
                      }}
                      disabled={uploadingFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-primary" />
                  <div>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      size="lg"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload PDF or ZIP
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF or ZIP up to 50MB
                    </p>
                  </div>
                  {uploadingFile && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="active" className="text-base font-medium">Active Resource</Label>
              <p className="text-sm text-muted-foreground">
                Make this resource available for download on your Hub
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploadingCover || uploadingFile}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || uploadingCover || uploadingFile || !fileUrl}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {resource ? 'Update Resource' : 'Create Resource'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
