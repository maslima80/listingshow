'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PublicTestimonialFormProps {
  token: string
  clientEmail: string | null
  propertyAddress: string | null
}

export function PublicTestimonialForm({ token, clientEmail, propertyAddress }: PublicTestimonialFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: clientEmail || '',
    clientLocation: '',
    testimonialText: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData,
          rating,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit testimonial')
      }

      toast({
        title: 'Success!',
        description: 'Your testimonial has been submitted. Thank you!',
      })

      // Show success message
      router.refresh()
    } catch (error) {
      console.error('Error submitting testimonial:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit testimonial. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center pb-8">
        <div className="text-6xl mb-4">⭐</div>
        <CardTitle className="text-3xl">Share Your Experience</CardTitle>
        <CardDescription className="text-base">
          We'd love to hear about your experience working with us
          {propertyAddress && (
            <span className="block mt-2 font-medium text-foreground">
              Property: {propertyAddress}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Your Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email *</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="clientLocation">Location (Optional)</Label>
            <Input
              id="clientLocation"
              value={formData.clientLocation}
              onChange={(e) => setFormData({ ...formData, clientLocation: e.target.value })}
              placeholder="Miami, FL"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </p>
          </div>

          {/* Testimonial */}
          <div className="space-y-2">
            <Label htmlFor="testimonialText">Your Testimonial *</Label>
            <Textarea
              id="testimonialText"
              value={formData.testimonialText}
              onChange={(e) => setFormData({ ...formData, testimonialText: e.target.value })}
              placeholder="Share your experience working with us..."
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.testimonialText.length} / 500 characters
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Submitting...' : 'Submit Testimonial'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your testimonial will be reviewed before being published
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
