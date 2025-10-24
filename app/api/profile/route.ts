import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentProfiles, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's team membership
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, session.user.id))
      .limit(1)

    if (!membership || membership.length === 0) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const teamId = membership[0].teamId

    // Get agent profile for this team
    const profile = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.teamId, teamId))
      .limit(1)

    if (!profile || profile.length === 0) {
      // Return empty profile structure
      return NextResponse.json({
        teamId,
        photoUrl: null,
        bioShort: null,
        bioLong: null,
        videoUrl: null,
        yearsExperience: null,
        homesSold: null,
        volumeSold: null,
        credentials: null,
        awards: null,
      })
    }

    return NextResponse.json(profile[0])
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
