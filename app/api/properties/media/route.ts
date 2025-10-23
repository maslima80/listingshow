import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties, mediaAssets, teamMembers } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

// GET /api/properties/media - Get all media from user's properties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, session.user.id))
      .limit(1)
      .then(rows => rows[0])

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get all properties for this team
    const teamProperties = await db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
      })
      .from(properties)
      .where(eq(properties.teamId, membership.teamId))

    if (teamProperties.length === 0) {
      return NextResponse.json({ propertiesWithMedia: [] })
    }

    // Get all media for these properties
    const propertyIds = teamProperties.map(p => p.id)
    
    const media = await db
      .select({
        id: mediaAssets.id,
        propertyId: mediaAssets.propertyId,
        type: mediaAssets.type,
        url: mediaAssets.url,
        thumbUrl: mediaAssets.thumbUrl,
        label: mediaAssets.label,
        position: mediaAssets.position,
      })
      .from(mediaAssets)
      .where(inArray(mediaAssets.propertyId, propertyIds))
      .orderBy(mediaAssets.position)

    // Group media by property
    const propertiesWithMedia = teamProperties.map(property => ({
      ...property,
      media: media.filter(m => m.propertyId === property.id),
    })).filter(p => p.media.length > 0) // Only include properties with media

    return NextResponse.json({ propertiesWithMedia })
  } catch (error) {
    console.error('Error fetching property media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
