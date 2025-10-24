import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentProfiles, teamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/profile - Get profile by teamId (public) or current user (authenticated)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    let targetTeamId: string

    if (teamId) {
      // Public access - get profile by teamId
      targetTeamId = teamId
    } else {
      // Authenticated access - get current user's profile
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

      targetTeamId = membership[0].teamId
    }

    // Get agent profile for this team
    const profiles = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.teamId, targetTeamId))
      .limit(1)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        profile: null,
      })
    }

    return NextResponse.json({
      profile: profiles[0],
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
