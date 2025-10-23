import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { neighborhoods, neighborhoodMedia, teamMembers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/neighborhoods - List all neighborhoods for the user's team
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

    // Get all neighborhoods for the team with their media
    const teamNeighborhoods = await db
      .select()
      .from(neighborhoods)
      .where(eq(neighborhoods.teamId, membership.teamId))
      .orderBy(desc(neighborhoods.position), desc(neighborhoods.createdAt))

    // Get media counts for each neighborhood
    const neighborhoodsWithMedia = await Promise.all(
      teamNeighborhoods.map(async (neighborhood) => {
        const media = await db
          .select()
          .from(neighborhoodMedia)
          .where(eq(neighborhoodMedia.neighborhoodId, neighborhood.id))

        return {
          ...neighborhood,
          mediaCount: media.length,
          photos: media.filter(m => m.type === 'photo').length,
          videos: media.filter(m => m.type === 'video').length,
        }
      })
    )

    return NextResponse.json(neighborhoodsWithMedia)
  } catch (error) {
    console.error('Error fetching neighborhoods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch neighborhoods' },
      { status: 500 }
    )
  }
}

// POST /api/neighborhoods - Create a new neighborhood
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
      name,
      slug,
      tagline,
      description,
      coverImageUrl,
      heroVideoUrl,
      statsJson,
      isPublished,
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists for this team
    const existing = await db.query.neighborhoods.findFirst({
      where: and(
        eq(neighborhoods.teamId, membership.teamId),
        eq(neighborhoods.slug, slug)
      ),
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A neighborhood with this slug already exists' },
        { status: 409 }
      )
    }

    // Get the highest position for ordering
    const allNeighborhoods = await db
      .select()
      .from(neighborhoods)
      .where(eq(neighborhoods.teamId, membership.teamId))

    const maxPosition = allNeighborhoods.length > 0
      ? Math.max(...allNeighborhoods.map(n => n.position))
      : -1

    // Create neighborhood
    const [newNeighborhood] = await db
      .insert(neighborhoods)
      .values({
        teamId: membership.teamId,
        name,
        slug,
        tagline: tagline || null,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        heroVideoUrl: heroVideoUrl || null,
        statsJson: statsJson || null,
        isPublished: isPublished ?? false,
        position: maxPosition + 1,
      })
      .returning()

    return NextResponse.json(newNeighborhood, { status: 201 })
  } catch (error) {
    console.error('Error creating neighborhood:', error)
    return NextResponse.json(
      { error: 'Failed to create neighborhood' },
      { status: 500 }
    )
  }
}
