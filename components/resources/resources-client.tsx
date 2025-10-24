'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, FileText, Download, Eye, EyeOff, Edit, Trash2, TrendingUp } from 'lucide-react'
import { ResourceDialog } from './resource-dialog-new'
import { ResourceDetailsDialog } from './resource-details-dialog'
import { useToast } from '@/hooks/use-toast'
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

interface Resource {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  fileUrl: string
  fileSize: number | null
  downloadCount: number
  isActive: boolean
  createdAt: string
}

export function ResourcesClient() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)
  const { toast } = useToast()

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources')
      if (!response.ok) throw new Error('Failed to fetch resources')
      const data = await response.json()
      setResources(data)
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast({
        title: 'Error',
        description: 'Failed to load resources',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleAdd = () => {
    setEditingResource(null)
    setDialogOpen(true)
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setDialogOpen(true)
  }

  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource)
    setDetailsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!resourceToDelete) return

    try {
      const response = await fetch(`/api/resources/${resourceToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete resource')

      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      })

      fetchResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
      })
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const toggleActive = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !resource.isActive }),
      })

      if (!response.ok) throw new Error('Failed to update resource')

      toast({
        title: 'Success',
        description: `Resource ${!resource.isActive ? 'activated' : 'deactivated'}`,
      })

      fetchResources()
    } catch (error) {
      console.error('Error updating resource:', error)
      toast({
        title: 'Error',
        description: 'Failed to update resource',
      })
    }
  }

  const handleSave = () => {
    setDialogOpen(false)
    fetchResources()
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
  }

  const totalDownloads = resources.reduce((sum, r) => sum + r.downloadCount, 0)
  const activeResources = resources.filter(r => r.isActive).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Resources</p>
              <p className="text-3xl font-bold">{resources.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Resources</p>
              <p className="text-3xl font-bold">{activeResources}</p>
            </div>
            <Eye className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
              <p className="text-3xl font-bold">{totalDownloads}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
          <p className="text-muted-foreground mb-6">
            Start capturing leads by adding valuable downloadable content like buyer guides, market reports, or checklists
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Resource
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {resource.coverImageUrl ? (
                  <img
                    src={resource.coverImageUrl}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleActive(resource)}
                    className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      resource.isActive
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {resource.isActive ? (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </button>
                </div>

                {/* Download Count Badge */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {resource.downloadCount}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{resource.title}</h3>
                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                {/* File Info */}
                <div className="text-xs text-muted-foreground mb-4">
                  {formatFileSize(resource.fileSize)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(resource)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resource)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResourceToDelete(resource)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={editingResource}
        onSave={handleSave}
      />

      {/* Details Dialog */}
      {selectedResource && (
        <ResourceDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          resourceId={selectedResource.id}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{resourceToDelete?.title}"? This will also delete
              all download history and lead data. This action cannot be undone.
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
    </>
  )
}
