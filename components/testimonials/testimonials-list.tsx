'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Video, Trash2, Check, X, Quote } from 'lucide-react'
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
import { useState } from 'react'

interface Testimonial {
  id: string
  clientName: string
  clientLocation: string | null
  clientPhotoUrl: string | null
  testimonialText: string
  rating: number | null
  videoUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string | null
  createdAt: string
}

interface TestimonialsListProps {
  testimonials: Testimonial[]
  loading: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  isPending?: boolean
}

export function TestimonialsList({
  testimonials,
  loading,
  onApprove,
  onReject,
  onDelete,
  showActions = false,
  isPending = false,
}: TestimonialsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (testimonialToDelete && onDelete) {
      onDelete(testimonialToDelete.id)
    }
    setDeleteDialogOpen(false)
    setTestimonialToDelete(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-48 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Quote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {isPending ? 'No pending testimonials' : 'No testimonials yet'}
        </h3>
        <p className="text-muted-foreground">
          {isPending
            ? 'New testimonial submissions will appear here for your approval'
            : 'Start building social proof by adding testimonials from your clients'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="p-6 relative">
            {/* Video Badge */}
            {testimonial.videoUrl && (
              <div className="absolute top-4 right-4">
                <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Video
                </div>
              </div>
            )}

            {/* Client Info */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={testimonial.clientPhotoUrl || undefined} />
                <AvatarFallback>
                  {testimonial.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold">{testimonial.clientName}</h3>
                {testimonial.clientLocation && (
                  <p className="text-sm text-muted-foreground">{testimonial.clientLocation}</p>
                )}
                
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial Text */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
              "{testimonial.testimonialText}"
            </p>

            {/* Date */}
            <p className="text-xs text-muted-foreground mb-4">
              {testimonial.submittedAt
                ? `Submitted ${new Date(testimonial.submittedAt).toLocaleDateString()}`
                : `Added ${new Date(testimonial.createdAt).toLocaleDateString()}`}
            </p>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                {isPending && onApprove && onReject && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => onApprove(testimonial.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(testimonial.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(testimonial)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the testimonial from {testimonialToDelete?.clientName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
