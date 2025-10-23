'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X } from 'lucide-react'

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
  const [fileSize, setFileSize] = useState('')
  const [isActive, setIsActive] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (resource) {
      setTitle(resource.title)
      setDescription(resource.description || '')
      setCoverImageUrl(resource.coverImageUrl || '')
      setFileUrl(resource.fileUrl)
      setFileSize(resource.fileSize ? String(resource.fileSize) : '')
      setIsActive(resource.isActive)
    } else {
      // Reset form
      setTitle('')
      setDescription('')
      setCoverImageUrl('')
      setFileUrl('')
      setFileSize('')
      setIsActive(true)
    }
  }, [resource, open])

  const handleSave = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and file URL are required',
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
          fileSize: fileSize ? parseInt(fileSize) : null,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Resource' : 'Add Resource'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., First-Time Home Buyer's Guide"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this resource offers..."
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
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
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px for best display
            </p>
          </div>

          {/* File URL */}
          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL *</Label>
            <Input
              id="fileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://... (PDF, Google Drive, Dropbox, etc.)"
            />
            <p className="text-xs text-muted-foreground">
              Direct link to PDF or file hosting service
            </p>
          </div>

          {/* File Size */}
          <div className="space-y-2">
            <Label htmlFor="fileSize">File Size (bytes, optional)</Label>
            <Input
              id="fileSize"
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="e.g., 2048000 (for 2MB)"
            />
            <p className="text-xs text-muted-foreground">
              Used for display only. 1 MB = 1,048,576 bytes
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="active" className="text-base">Active Resource</Label>
              <p className="text-sm text-muted-foreground">
                Make this resource available for download
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
              💡 Lead Magnet Tips:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use compelling titles that highlight value</li>
              <li>• Keep files under 5MB for faster downloads</li>
              <li>• PDFs work best for guides and checklists</li>
              <li>• Every download captures lead info (name, email, phone)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {resource ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
