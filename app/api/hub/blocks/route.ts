import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hubBlocks, hubPages, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// Schema for creating/updating blocks
const blockSchema = z.object({
  type: z.enum([
    'hero',
    'about',
    'properties',
    'neighborhoods',
    'testimonials',
    'blog',
    'valuation',
    'mortgage',
    'lead_magnet',
    'contact',
    'social_footer',
    'property',
    'link',
    'image',
    'video',
    'text',
    'spacer',
  ]),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  propertyId: z.string().optional().nullable(),
  settingsJson: z.any().optional().nullable(), // For premium blocks
  position: z.number().int().default(0),
  isVisible: z.boolean().default(true),
})

// GET /api/hub/blocks - List all blocks for user's team
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

    // Get or create hub page
    let hubPage = await db.query.hubPages.findFirst({
      where: eq(hubPages.teamId, membership.teamId)
    })

    if (!hubPage) {
      const [newHub] = await db.insert(hubPages).values({
        teamId: membership.teamId,
        title: 'My Hub',
        isPublic: true,
      }).returning()
      hubPage = newHub
    }

    // Get all blocks (without relations for now)
    const blocks = await db
      .select()
      .from(hubBlocks)
      .where(eq(hubBlocks.hubId, hubPage.id))
      .orderBy(hubBlocks.position)

    return NextResponse.json({ blocks, hubId: hubPage.id })
  } catch (error) {
    console.error('Error fetching hub blocks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hub/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = blockSchema.parse(body)

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, session.user.id),
    })

    if (!membership) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    // Get or create hub page
    let hubPage = await db.query.hubPages.findFirst({
      where: eq(hubPages.teamId, membership.teamId)
    })

    if (!hubPage) {
      const [newHub] = await db.insert(hubPages).values({
        teamId: membership.teamId,
        title: 'My Hub',
        isPublic: true,
      }).returning()
      hubPage = newHub
    }

    // Create block
    const [block] = await db.insert(hubBlocks).values({
      hubId: hubPage.id,
      ...validatedData,
    }).returning()

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error creating hub block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
