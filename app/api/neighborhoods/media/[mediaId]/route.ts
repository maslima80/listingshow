import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { neighborhoods, neighborhoodMedia, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { deleteFromImageKit } from '@/lib/imagekit'
import { deleteFromBunny } from '@/lib/bunny'

// DELETE /api/neighborhoods/media/[mediaId] - Delete a media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params
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
      where: eq(neighborhoodMedia.id, mediaId),
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

    // Clean up from storage provider
    if (media.provider && media.providerId) {
      try {
        if (media.provider === 'imagekit') {
          await deleteFromImageKit(media.providerId)
        } else if (media.provider === 'bunny') {
          await deleteFromBunny(media.providerId)
        }
      } catch (error) {
        console.error(`Failed to delete from ${media.provider}:`, error)
        // Continue with database deletion even if storage cleanup fails
      }
    }

    // Delete media from database
    await db.delete(neighborhoodMedia).where(eq(neighborhoodMedia.id, mediaId))

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
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params
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
      where: eq(neighborhoodMedia.id, mediaId),
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
      .where(eq(neighborhoodMedia.id, mediaId))
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
