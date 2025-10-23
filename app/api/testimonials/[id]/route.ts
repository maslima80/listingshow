import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { testimonials, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/testimonials/[id] - Get a single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get testimonial
    const testimonial = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.id, params.id),
        eq(testimonials.teamId, membership.teamId)
      ),
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error fetching testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    )
  }
}

// PATCH /api/testimonials/[id] - Update a testimonial
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify testimonial belongs to team
    const testimonial = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.id, params.id),
        eq(testimonials.teamId, membership.teamId)
      ),
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
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
      status,
    } = body

    // Update testimonial
    const [updated] = await db
      .update(testimonials)
      .set({
        ...(clientName !== undefined && { clientName }),
        ...(clientLocation !== undefined && { clientLocation }),
        ...(clientPhotoUrl !== undefined && { clientPhotoUrl }),
        ...(testimonialText !== undefined && { testimonialText }),
        ...(rating !== undefined && { rating }),
        ...(propertyId !== undefined && { propertyId }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(status !== undefined && { 
          status: status as 'approved' | 'pending' | 'rejected',
          // Set approvedAt when status changes to approved
          ...(status === 'approved' && !testimonial.approvedAt && { approvedAt: new Date() }),
        }),
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

// DELETE /api/testimonials/[id] - Delete a testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify testimonial belongs to team
    const testimonial = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.id, params.id),
        eq(testimonials.teamId, membership.teamId)
      ),
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Delete testimonial
    await db.delete(testimonials).where(eq(testimonials.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
