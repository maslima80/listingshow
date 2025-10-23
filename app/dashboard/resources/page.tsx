import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ResourcesClient } from '@/components/resources/resources-client'
import { DashboardClientWrapper } from '@/components/dashboard-client'

export const metadata = {
  title: 'Resources | Listing.Show',
  description: 'Manage lead magnets and downloadable resources',
}

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/signin')
  }

  if (!session.user.teamId) {
    redirect('/onboarding')
  }

  return (
    <DashboardClientWrapper 
      userName={session.user.name || undefined}
      teamSlug={session.user.teamSlug || undefined}
    >
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Resources & Lead Magnets</h1>
          <p className="text-muted-foreground">
            Capture leads with valuable downloadable content like buyer guides, market reports, and checklists
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ResourcesClient />
        </Suspense>
      </div>
    </DashboardClientWrapper>
  )
}
