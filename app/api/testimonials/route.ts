import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { testimonials, teamMembers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/testimonials - List testimonials for the user's team
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'approved', 'pending', 'rejected', or null for all

    // Build query
    let query = db
      .select()
      .from(testimonials)
      .where(eq(testimonials.teamId, membership.teamId))
      .$dynamic()

    // Apply status filter if provided
    if (status && ['approved', 'pending', 'rejected'].includes(status)) {
      query = query.where(
        and(
          eq(testimonials.teamId, membership.teamId),
          eq(testimonials.status, status as 'approved' | 'pending' | 'rejected')
        )
      )
    }

    const teamTestimonials = await query.orderBy(desc(testimonials.createdAt))

    return NextResponse.json(teamTestimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Create a new testimonial manually
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      clientName,
      clientLocation,
      clientPhotoUrl,
      testimonialText,
      rating,
      propertyId,
      videoUrl,
      status = 'approved', // Manually added testimonials are auto-approved
    } = body

    // Validate required fields
    if (!clientName || !testimonialText) {
      return NextResponse.json(
        { error: 'Client name and testimonial text are required' },
        { status: 400 }
      )
    }

    // Create testimonial
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        teamId: membership.teamId,
        clientName,
        clientLocation: clientLocation || null,
        clientPhotoUrl: clientPhotoUrl || null,
        testimonialText,
        rating: rating || null,
        propertyId: propertyId || null,
        videoUrl: videoUrl || null,
        status: status as 'approved' | 'pending' | 'rejected',
        submittedAt: new Date(),
        approvedAt: status === 'approved' ? new Date() : null,
      })
      .returning()

    return NextResponse.json(newTestimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
