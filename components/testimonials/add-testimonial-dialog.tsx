'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Star } from 'lucide-react'

interface AddTestimonialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function AddTestimonialDialog({ open, onOpenChange, onSave }: AddTestimonialDialogProps) {
  const [loading, setLoading] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientLocation, setClientLocation] = useState('')
  const [clientPhotoUrl, setClientPhotoUrl] = useState('')
  const [testimonialText, setTestimonialText] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [videoUrl, setVideoUrl] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setClientName('')
      setClientLocation('')
      setClientPhotoUrl('')
      setTestimonialText('')
      setRating(5)
      setVideoUrl('')
    }
  }, [open])

  const handleSave = async () => {
    if (!clientName.trim() || !testimonialText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client name and testimonial text are required',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientLocation: clientLocation || null,
          clientPhotoUrl: clientPhotoUrl || null,
          testimonialText,
          rating,
          videoUrl: videoUrl || null,
          status: 'approved', // Manually added testimonials are auto-approved
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add testimonial')
      }

      toast({
        title: 'Success',
        description: 'Testimonial added successfully',
      })

      onSave()
    } catch (error: any) {
      console.error('Error adding testimonial:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add testimonial',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Testimonial Manually</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Smith"
            />
          </div>

          {/* Client Location */}
          <div className="space-y-2">
            <Label htmlFor="clientLocation">Location (Optional)</Label>
            <Input
              id="clientLocation"
              value={clientLocation}
              onChange={(e) => setClientLocation(e.target.value)}
              placeholder="Miami, FL"
            />
          </div>

          {/* Client Photo */}
          <div className="space-y-2">
            <Label htmlFor="clientPhoto">Client Photo URL (Optional)</Label>
            <Input
              id="clientPhoto"
              value={clientPhotoUrl}
              onChange={(e) => setClientPhotoUrl(e.target.value)}
              placeholder="https://..."
            />
            {clientPhotoUrl && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                <img
                  src={clientPhotoUrl}
                  alt="Client preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} {rating === 1 ? 'star' : 'stars'}
              </span>
            </div>
          </div>

          {/* Testimonial Text */}
          <div className="space-y-2">
            <Label htmlFor="testimonialText">Testimonial *</Label>
            <Textarea
              id="testimonialText"
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Share what the client said about their experience..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {testimonialText.length} characters (recommended: 100-500)
            </p>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video Testimonial URL (Optional)</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/... or video URL"
            />
            <p className="text-xs text-muted-foreground">
              YouTube, Vimeo, or direct video link
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Testimonial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
