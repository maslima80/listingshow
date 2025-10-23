import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { teamMembers, teamThemes, teams, themes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DashboardClientWrapper } from '@/components/dashboard-client'
import { HubEditorClient } from '@/components/hub/hub-editor-client'

export default async function HubPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get user's team membership (simplified query)
  const membership = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, session.user.id))
    .limit(1)
    .then(rows => rows[0])

  if (!membership) {
    redirect('/onboarding')
  }

  // Get team separately
  const team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, membership.teamId)
  })

  if (!team) {
    redirect('/onboarding')
  }

  // Get team theme with full theme data
  const [teamThemeData] = await db
    .select({
      accentColor: teamThemes.accentColor,
      themeMode: themes.mode,
      tokensJson: themes.tokensJson,
    })
    .from(teamThemes)
    .innerJoin(themes, eq(teamThemes.themeId, themes.id))
    .where(eq(teamThemes.teamId, membership.teamId))
    .limit(1)

  const accentColor = teamThemeData?.accentColor || '#C9A66B'
  const themeMode = teamThemeData?.themeMode || 'dark'
  const themeTokens = (teamThemeData?.tokensJson as any) || {}
  const backgroundColor = themeTokens?.colors?.background || (themeMode === 'dark' ? '#0f172a' : '#ffffff')

  return (
    <DashboardClientWrapper 
      userName={session.user.name || undefined}
      teamSlug={team.slug}
    >
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Hub Builder</h1>
            <p className="text-sm text-slate-600">
              Create your link-in-bio page • 
              <a 
                href={`/u/${team.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline"
              >
                listing.show/u/{team.slug}
              </a>
            </p>
          </div>

          {/* Hub Editor */}
          <HubEditorClient 
            teamSlug={team.slug}
            accentColor={accentColor}
            themeMode={themeMode}
            backgroundColor={backgroundColor}
          />
        </div>
      </main>
    </DashboardClientWrapper>
  )
}
