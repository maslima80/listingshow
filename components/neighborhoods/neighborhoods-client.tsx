'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, MapPin, Image, Video, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { NeighborhoodDialog } from './neighborhood-dialog'
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

interface Neighborhood {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  coverImageUrl: string | null
  heroVideoUrl: string | null
  isPublished: boolean
  mediaCount?: number
  photos?: number
  videos?: number
  createdAt: string
}

export function NeighborhoodsClient() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [neighborhoodToDelete, setNeighborhoodToDelete] = useState<Neighborhood | null>(null)
  const { toast } = useToast()

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch('/api/neighborhoods')
      if (!response.ok) throw new Error('Failed to fetch neighborhoods')
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
      toast({
        title: 'Error',
        description: 'Failed to load neighborhoods',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNeighborhoods()
  }, [])

  const handleAdd = () => {
    setEditingNeighborhood(null)
    setDialogOpen(true)
  }

  const handleEdit = (neighborhood: Neighborhood) => {
    setEditingNeighborhood(neighborhood)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!neighborhoodToDelete) return

    try {
      const response = await fetch(`/api/neighborhoods/${neighborhoodToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete neighborhood')

      toast({
        title: 'Success',
        description: 'Neighborhood deleted successfully',
      })

      fetchNeighborhoods()
    } catch (error) {
      console.error('Error deleting neighborhood:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete neighborhood',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setNeighborhoodToDelete(null)
    }
  }

  const togglePublished = async (neighborhood: Neighborhood) => {
    try {
      const response = await fetch(`/api/neighborhoods/${neighborhood.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !neighborhood.isPublished }),
      })

      if (!response.ok) throw new Error('Failed to update neighborhood')

      toast({
        title: 'Success',
        description: `Neighborhood ${!neighborhood.isPublished ? 'published' : 'unpublished'}`,
      })

      fetchNeighborhoods()
    } catch (error) {
      console.error('Error updating neighborhood:', error)
      toast({
        title: 'Error',
        description: 'Failed to update neighborhood',
        variant: 'destructive',
      })
    }
  }

  const handleSave = () => {
    setDialogOpen(false)
    fetchNeighborhoods()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-64 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {neighborhoods.length} {neighborhoods.length === 1 ? 'neighborhood' : 'neighborhoods'}
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Neighborhood
        </Button>
      </div>

      {neighborhoods.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No neighborhoods yet</h3>
          <p className="text-muted-foreground mb-6">
            Start showcasing your local expertise by adding neighborhoods you serve
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Neighborhood
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {neighborhoods.map((neighborhood) => (
            <Card key={neighborhood.id} className="overflow-hidden group">
              {/* Cover Image */}
              <div className="relative h-48 bg-muted">
                {neighborhood.coverImageUrl ? (
                  <img
                    src={neighborhood.coverImageUrl}
                    alt={neighborhood.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => togglePublished(neighborhood)}
                    className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      neighborhood.isPublished
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {neighborhood.isPublished ? (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{neighborhood.name}</h3>
                {neighborhood.tagline && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {neighborhood.tagline}
                  </p>
                )}

                {/* Media Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {(neighborhood.photos ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {neighborhood.photos}
                    </div>
                  )}
                  {(neighborhood.videos ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      {neighborhood.videos}
                    </div>
                  )}
                  {(neighborhood.mediaCount ?? 0) === 0 && (
                    <span className="text-xs">No media yet</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(neighborhood)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNeighborhoodToDelete(neighborhood)
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
      <NeighborhoodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        neighborhood={editingNeighborhood}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Neighborhood?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{neighborhoodToDelete?.name}"? This will also delete
              all associated media. This action cannot be undone.
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
