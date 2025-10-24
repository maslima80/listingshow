import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hubBlocks, teamMembers, hubPages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  url: z.string().url().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  position: z.number().int().optional(),
  isVisible: z.boolean().optional(),
  settingsJson: z.any().optional(), // Allow any JSON for block settings
})

// PATCH /api/hub/blocks/[id] - Update a block
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Verify ownership
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, session.user.id))
      .limit(1)
      .then(rows => rows[0])

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get block
    const block = await db.query.hubBlocks.findFirst({
      where: eq(hubBlocks.id, params.id)
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Verify it belongs to user's team
    const hubPage = await db.query.hubPages.findFirst({
      where: eq(hubPages.id, block.hubId)
    })

    if (!hubPage || hubPage.teamId !== membership.teamId) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Update block
    const [updatedBlock] = await db
      .update(hubBlocks)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(hubBlocks.id, params.id))
      .returning()

    return NextResponse.json({ block: updatedBlock })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error updating hub block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hub/blocks/[id] - Delete a block
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, session.user.id))
      .limit(1)
      .then(rows => rows[0])

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get block
    const block = await db.query.hubBlocks.findFirst({
      where: eq(hubBlocks.id, params.id)
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Verify it belongs to user's team
    const hubPage = await db.query.hubPages.findFirst({
      where: eq(hubPages.id, block.hubId)
    })

    if (!hubPage || hubPage.teamId !== membership.teamId) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Delete block
    await db.delete(hubBlocks).where(eq(hubBlocks.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hub block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
