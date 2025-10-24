import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties, teamMembers, mediaAssets } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

// GET /api/properties - List properties for user's team
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const idsParam = searchParams.get('ids')
    const limit = searchParams.get('limit')

    // Build where conditions
    const conditions = [eq(properties.teamId, membership.teamId)]
    
    // Filter by specific IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean)
      if (ids.length > 0) {
        conditions.push(inArray(properties.id, ids))
      }
    }
    
    // Filter by status if provided
    if (status === 'published' || status === 'draft') {
      conditions.push(eq(properties.status, status))
    }

    // Execute query with full property data and join with media assets for cover image
    let query = db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        status: properties.status,
        listingPurpose: properties.listingPurpose,
        location: properties.location,
        coverAssetId: properties.coverAssetId,
        coverImageUrl: mediaAssets.url,
        price: properties.price,
        currency: properties.currency,
        priceVisibility: properties.priceVisibility,
        rentPeriod: properties.rentPeriod,
        beds: properties.beds,
        baths: properties.baths,
        areaSqft: properties.areaSqft,
      })
      .from(properties)
      .leftJoin(mediaAssets, eq(properties.coverAssetId, mediaAssets.id))
      .where(and(...conditions))

    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum) as any
      }
    }

    const propertyList = await query

    return NextResponse.json({ properties: propertyList })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
