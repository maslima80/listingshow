import { Suspense } from 'react'
import { TestimonialsClient } from '@/components/testimonials/testimonials-client'

export const metadata = {
  title: 'Testimonials | Listing.Show',
  description: 'Manage client testimonials',
}

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Testimonials</h1>
        <p className="text-muted-foreground">
          Build trust with authentic client reviews and video testimonials
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TestimonialsClient />
      </Suspense>
    </div>
  )
}
