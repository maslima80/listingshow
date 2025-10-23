import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hubBlocks, teamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const reorderSchema = z.object({
  blockIds: z.array(z.string().uuid()),
})

// POST /api/hub/blocks/reorder - Reorder blocks
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { blockIds } = reorderSchema.parse(body)

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

    // Update positions in a transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < blockIds.length; i++) {
        await tx
          .update(hubBlocks)
          .set({ position: i, updatedAt: new Date() })
          .where(eq(hubBlocks.id, blockIds[i]))
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error reordering hub blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
