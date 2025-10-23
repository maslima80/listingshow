import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { resources, resourceDownloads, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/resources/[id] - Get a single resource with download stats
export async function GET(
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

    // Get resource
    const resource = await db.query.resources.findFirst({
      where: and(
        eq(resources.id, params.id),
        eq(resources.teamId, membership.teamId)
      ),
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Get download history
    const downloads = await db
      .select()
      .from(resourceDownloads)
      .where(eq(resourceDownloads.resourceId, params.id))
      .orderBy(resourceDownloads.downloadedAt)

    return NextResponse.json({
      ...resource,
      downloads,
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

// PATCH /api/resources/[id] - Update a resource
export async function PATCH(
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

    // Verify resource belongs to team
    const resource = await db.query.resources.findFirst({
      where: and(
        eq(resources.id, params.id),
        eq(resources.teamId, membership.teamId)
      ),
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      coverImageUrl,
      fileUrl,
      fileSize,
      isActive,
    } = body

    // Update resource
    const [updated] = await db
      .update(resources)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileSize !== undefined && { fileSize }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(resources.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(
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

    // Verify resource belongs to team
    const resource = await db.query.resources.findFirst({
      where: and(
        eq(resources.id, params.id),
        eq(resources.teamId, membership.teamId)
      ),
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Delete resource (cascade will delete downloads)
    await db.delete(resources).where(eq(resources.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
