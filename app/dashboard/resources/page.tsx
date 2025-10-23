import { Suspense } from 'react'
import { ResourcesClient } from '@/components/resources/resources-client'

export const metadata = {
  title: 'Resources | Listing.Show',
  description: 'Manage lead magnets and downloadable resources',
}

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resources & Lead Magnets</h1>
        <p className="text-muted-foreground">
          Capture leads with valuable downloadable content like buyer guides, market reports, and checklists
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResourcesClient />
      </Suspense>
    </div>
  )
}
