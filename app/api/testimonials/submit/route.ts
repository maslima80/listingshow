import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { testimonials, testimonialRequests } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// POST /api/testimonials/submit - Public endpoint for submitting testimonials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      token,
      clientName,
      clientLocation,
      clientPhotoUrl,
      testimonialText,
      rating,
    } = body

    // Validate required fields
    if (!token || !clientName || !testimonialText) {
      return NextResponse.json(
        { error: 'Token, name, and testimonial text are required' },
        { status: 400 }
      )
    }

    // Find the request by token
    const request_record = await db.query.testimonialRequests.findFirst({
      where: eq(testimonialRequests.token, token),
    })

    if (!request_record) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Check if already submitted
    if (request_record.submitted) {
      return NextResponse.json(
        { error: 'This testimonial has already been submitted' },
        { status: 409 }
      )
    }

    // Generate submission token for the testimonial
    const submissionToken = token // Reuse the request token

    // Create testimonial with pending status
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        teamId: request_record.teamId,
        clientName,
        clientLocation: clientLocation || null,
        clientPhotoUrl: clientPhotoUrl || null,
        testimonialText,
        rating: rating || null,
        propertyId: null,
        videoUrl: null,
        status: 'pending',
        submissionToken,
        submittedAt: new Date(),
        approvedAt: null,
      })
      .returning()

    // Mark request as submitted
    await db
      .update(testimonialRequests)
      .set({ submitted: true })
      .where(eq(testimonialRequests.token, token))

    return NextResponse.json({
      success: true,
      testimonial: newTestimonial,
    }, { status: 201 })
  } catch (error) {
    console.error('Error submitting testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
