import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { neighborhoods, neighborhoodMedia, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { deleteFromImageKit } from '@/lib/imagekit'
import { deleteFromBunny } from '@/lib/bunny'

// GET /api/neighborhoods/[id] - Get a single neighborhood with media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get neighborhood
    const neighborhood = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.id, id),
        eq(neighborhoods.teamId, membership.teamId)
      ),
    })

    if (!neighborhood) {
      return NextResponse.json({ error: 'Neighborhood not found' }, { status: 404 })
    }

    // Get media
    const media = await db
      .select()
      .from(neighborhoodMedia)
      .where(eq(neighborhoodMedia.neighborhoodId, id))
      .orderBy(neighborhoodMedia.position)

    return NextResponse.json({
      ...neighborhood,
      media,
    })
  } catch (error) {
    console.error('Error fetching neighborhood:', error)
    return NextResponse.json(
      { error: 'Failed to fetch neighborhood' },
      { status: 500 }
    )
  }
}

// PATCH /api/neighborhoods/[id] - Update a neighborhood
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify neighborhood belongs to team
    const neighborhood = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.id, id),
        eq(neighborhoods.teamId, membership.teamId)
      ),
    })

    if (!neighborhood) {
      return NextResponse.json({ error: 'Neighborhood not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      tagline,
      description,
      coverImageUrl,
      heroVideoUrl,
      statsJson,
      isPublished,
      position,
    } = body

    // If slug is changing, check for conflicts
    if (slug && slug !== neighborhood.slug) {
      const existing = await db.query.neighborhoods.findFirst({
        where: and(
          eq(neighborhoods.teamId, membership.teamId),
          eq(neighborhoods.slug, slug)
        ),
      })

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'A neighborhood with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update neighborhood
    const [updated] = await db
      .update(neighborhoods)
      .set({
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(heroVideoUrl !== undefined && { heroVideoUrl }),
        ...(statsJson !== undefined && { statsJson }),
        ...(isPublished !== undefined && { isPublished }),
        ...(position !== undefined && { position }),
        updatedAt: new Date(),
      })
      .where(eq(neighborhoods.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating neighborhood:', error)
    return NextResponse.json(
      { error: 'Failed to update neighborhood' },
      { status: 500 }
    )
  }
}

// DELETE /api/neighborhoods/[id] - Delete a neighborhood
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify neighborhood belongs to team
    const neighborhood = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.id, id),
        eq(neighborhoods.teamId, membership.teamId)
      ),
    })

    if (!neighborhood) {
      return NextResponse.json({ error: 'Neighborhood not found' }, { status: 404 })
    }

    // Get all media for cleanup
    const media = await db
      .select()
      .from(neighborhoodMedia)
      .where(eq(neighborhoodMedia.neighborhoodId, id))

    // Clean up all media from storage providers
    for (const item of media) {
      if (item.provider && item.providerId) {
        try {
          if (item.provider === 'imagekit') {
            await deleteFromImageKit(item.providerId)
          } else if (item.provider === 'bunny') {
            await deleteFromBunny(item.providerId)
          }
        } catch (error) {
          console.error(`Failed to delete ${item.type} from ${item.provider}:`, error)
          // Continue with other deletions
        }
      }
    }

    // Delete neighborhood (cascade will delete media from database)
    await db.delete(neighborhoods).where(eq(neighborhoods.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting neighborhood:', error)
    return NextResponse.json(
      { error: 'Failed to delete neighborhood' },
      { status: 500 }
    )
  }
}
