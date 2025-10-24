import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { neighborhoods, neighborhoodMedia, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/neighborhoods/[id]/media - Add media to a neighborhood
export async function POST(
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
    const { type, url, caption, thumbUrl, provider, providerId, durationSec } = body

    // Validate required fields
    if (!type || !url) {
      return NextResponse.json(
        { error: 'Type and URL are required' },
        { status: 400 }
      )
    }

    if (!['photo', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be photo or video' },
        { status: 400 }
      )
    }

    // Get the highest position for ordering
    const existingMedia = await db
      .select()
      .from(neighborhoodMedia)
      .where(eq(neighborhoodMedia.neighborhoodId, id))

    const maxPosition = existingMedia.length > 0
      ? Math.max(...existingMedia.map(m => m.position))
      : -1

    // Add media
    const [newMedia] = await db
      .insert(neighborhoodMedia)
      .values({
        neighborhoodId: id,
        type: type as 'photo' | 'video',
        url,
        thumbUrl: thumbUrl || null,
        caption: caption || null,
        provider: provider || null,
        providerId: providerId || null,
        durationSec: durationSec || null,
        position: maxPosition + 1,
      })
      .returning()

    return NextResponse.json(newMedia, { status: 201 })
  } catch (error) {
    console.error('Error adding media:', error)
    return NextResponse.json(
      { error: 'Failed to add media' },
      { status: 500 }
    )
  }
}

// GET /api/neighborhoods/[id]/media - Get all media for a neighborhood
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

    // Get all media for this neighborhood
    const media = await db
      .select()
      .from(neighborhoodMedia)
      .where(eq(neighborhoodMedia.neighborhoodId, id))
      .orderBy(neighborhoodMedia.position)

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
