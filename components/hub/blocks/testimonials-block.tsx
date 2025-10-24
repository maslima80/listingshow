'use client'

import { TestimonialsBlockSettings } from '@/lib/types/hub-blocks'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Testimonial {
  id: string
  clientName: string
  clientLocation: string | null
  clientPhotoUrl: string | null
  testimonialText: string
  rating: number | null
  videoUrl: string | null
}

interface TestimonialsBlockProps {
  settings: TestimonialsBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function TestimonialsBlock({
  settings,
  teamId,
  isPreview = false,
}: TestimonialsBlockProps) {
  const {
    displayType = 'carousel',
    testimonialIds,
    showPhotos = true,
    showRatings = true,
    showVideo = true,
    autoRotate = true,
    rotationSpeed = 5000,
    limit = 10,
  } = settings

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        
        // Filter approved testimonials only
        const approved = data.filter((t: any) => t.status === 'approved')
        
        // Filter by selected IDs or use all
        const filtered = testimonialIds === 'all' || !testimonialIds || testimonialIds.length === 0
          ? approved
          : approved.filter((t: Testimonial) => testimonialIds.includes(t.id))

        // Apply limit
        const limited = filtered.slice(0, limit || 10)
        
        setTestimonials(limited)
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        setTestimonials([])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [testimonialIds, limit])

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1 || displayType !== 'carousel') return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [autoRotate, testimonials.length, rotationSpeed, displayType])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  if (displayType === 'carousel') {
    const current = testimonials[currentIndex]

    return (
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Clients Say</h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from real people
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-background rounded-2xl p-8 md:p-12 shadow-xl"
              >
                {/* Quote Icon */}
                <Quote className="w-12 h-12 text-primary/20 mb-6" />

                {/* Testimonial Text */}
                <p className="text-xl md:text-2xl leading-relaxed mb-8 text-foreground/90">
                  "{current.testimonialText}"
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-4">
                  {showPhotos && current.clientPhotoUrl && (
                    <img
                      src={current.clientPhotoUrl}
                      alt={current.clientName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{current.clientName}</div>
                    {current.clientLocation && (
                      <div className="text-sm text-muted-foreground">
                        {current.clientLocation}
                      </div>
                    )}
                    
                    {showRatings && current.rating && (
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < current.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-lg"
                  onClick={prevTestimonial}
                  disabled={isPreview}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-lg"
                  onClick={nextTestimonial}
                  disabled={isPreview}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      disabled={isPreview}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-primary w-8'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Grid layout (future enhancement)
  return null
}
