import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { testimonials, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/testimonials/[id]/approve - Approve a testimonial
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

    // Approve testimonial
    const [updated] = await db
      .update(testimonials)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(testimonials.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error approving testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to approve testimonial' },
      { status: 500 }
    )
  }
}
