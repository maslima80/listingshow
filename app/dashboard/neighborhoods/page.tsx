import { Suspense } from 'react'
import { NeighborhoodsClient } from '@/components/neighborhoods/neighborhoods-client'

export const metadata = {
  title: 'Neighborhoods | Listing.Show',
  description: 'Manage your neighborhood content',
}

export default function NeighborhoodsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neighborhoods</h1>
        <p className="text-muted-foreground">
          Showcase your local expertise with rich neighborhood content
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <NeighborhoodsClient />
      </Suspense>
    </div>
  )
}
