import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { neighborhoods, neighborhoodMedia, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// DELETE /api/neighborhoods/media/[mediaId] - Delete a media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
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

    // Get media item
    const media = await db.query.neighborhoodMedia.findFirst({
      where: eq(neighborhoodMedia.id, params.mediaId),
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Verify neighborhood belongs to team
    const neighborhood = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.id, media.neighborhoodId),
        eq(neighborhoods.teamId, membership.teamId)
      ),
    })

    if (!neighborhood) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete media
    await db.delete(neighborhoodMedia).where(eq(neighborhoodMedia.id, params.mediaId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}

// PATCH /api/neighborhoods/media/[mediaId] - Update media (caption, position)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
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

    // Get media item
    const media = await db.query.neighborhoodMedia.findFirst({
      where: eq(neighborhoodMedia.id, params.mediaId),
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Verify neighborhood belongs to team
    const neighborhood = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.id, media.neighborhoodId),
        eq(neighborhoods.teamId, membership.teamId)
      ),
    })

    if (!neighborhood) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { caption, position } = body

    // Update media
    const [updated] = await db
      .update(neighborhoodMedia)
      .set({
        ...(caption !== undefined && { caption }),
        ...(position !== undefined && { position }),
      })
      .where(eq(neighborhoodMedia.id, params.mediaId))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
