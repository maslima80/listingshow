import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { testimonialRequests } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PublicTestimonialForm } from '@/components/testimonials/public-testimonial-form'

interface PageProps {
  params: {
    token: string
  }
}

export default async function PublicTestimonialPage({ params }: PageProps) {
  const { token } = await params

  // Verify token exists and is not expired
  const request = await db
    .select()
    .from(testimonialRequests)
    .where(eq(testimonialRequests.token, token))
    .limit(1)

  if (!request || request.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">
            This testimonial request link is invalid or has expired.
          </p>
        </div>
      </div>
    )
  }

  const requestData = request[0]

  // Check if already submitted
  if (requestData.submittedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Already Submitted</h1>
          <p className="text-muted-foreground">
            You've already submitted your testimonial. Thank you!
          </p>
        </div>
      </div>
    )
  }

  // Check if expired (30 days)
  const expiresAt = new Date(requestData.createdAt)
  expiresAt.setDate(expiresAt.getDate() + 30)
  
  if (new Date() > expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-muted-foreground">
            This testimonial request link has expired. Please contact the agent for a new link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PublicTestimonialForm
          token={token}
          clientEmail={requestData.clientEmail}
          propertyAddress={requestData.propertyAddress}
        />
      </div>
    </div>
  )
}
