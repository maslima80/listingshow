import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where conditions
    const conditions = [eq(properties.teamId, membership.teamId)]
    
    if (status === 'published' || status === 'draft') {
      conditions.push(eq(properties.status, status))
    }

    // Execute query
    const propertyList = await db
      .select({
        id: properties.id,
        title: properties.title,
        slug: properties.slug,
        status: properties.status,
        coverAssetId: properties.coverAssetId,
      })
      .from(properties)
      .where(and(...conditions))

    return NextResponse.json({ properties: propertyList })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
