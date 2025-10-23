import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { resources, teamMembers } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/resources - List all resources for the user's team
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

    // Get all resources for the team
    const teamResources = await db
      .select()
      .from(resources)
      .where(eq(resources.teamId, membership.teamId))
      .orderBy(desc(resources.createdAt))

    return NextResponse.json(teamResources)
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/resources - Create a new resource
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
      title,
      description,
      coverImageUrl,
      fileUrl,
      fileSize,
      isActive = true,
    } = body

    // Validate required fields
    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: 'Title and file URL are required' },
        { status: 400 }
      )
    }

    // Create resource
    const [newResource] = await db
      .insert(resources)
      .values({
        teamId: membership.teamId,
        title,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        fileUrl,
        fileSize: fileSize || null,
        downloadCount: 0,
        isActive,
      })
      .returning()

    return NextResponse.json(newResource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}
