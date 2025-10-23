import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { testimonials, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/testimonials/[id]/reject - Reject a testimonial
export async function POST(
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

    // Reject testimonial
    const [updated] = await db
      .update(testimonials)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error rejecting testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to reject testimonial' },
      { status: 500 }
    )
  }
}
