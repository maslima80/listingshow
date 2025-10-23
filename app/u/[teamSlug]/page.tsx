import { db } from '@/lib/db'
import { teams, hubPages, hubBlocks, teamThemes, themes, mediaAssets } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PublicHubClient } from '@/components/hub/public-hub-client'

export async function generateMetadata({ params }: { params: { teamSlug: string } }) {
  const team = await db.query.teams.findFirst({
    where: eq(teams.slug, params.teamSlug)
  })

  if (!team) {
    return {
      title: 'Not Found'
    }
  }

  return {
    title: `${team.name} | Listing.Show`,
    description: `Premium real estate by ${team.name}`,
  }
}

export default async function PublicHubPage({ params }: { params: { teamSlug: string } }) {
  // Get team
  const team = await db.query.teams.findFirst({
    where: eq(teams.slug, params.teamSlug)
  })

  if (!team) {
    notFound()
  }

  // Get hub page
  const hubPage = await db.query.hubPages.findFirst({
    where: eq(hubPages.teamId, team.id)
  })

  if (!hubPage || !hubPage.isPublic) {
    notFound()
  }

  // Get visible blocks
  const blocks = await db
    .select()
    .from(hubBlocks)
    .where(and(
      eq(hubBlocks.hubId, hubPage.id),
      eq(hubBlocks.isVisible, true)
    ))
    .orderBy(hubBlocks.position)

  // For now, we'll pass empty coverImageMap - can enhance later
  const coverImageMap: Record<string, string> = {}

  // Get team theme with full theme data
  const [teamThemeData] = await db
    .select({
      accentColor: teamThemes.accentColor,
      themeMode: themes.mode,
      tokensJson: themes.tokensJson,
    })
    .from(teamThemes)
    .innerJoin(themes, eq(teamThemes.themeId, themes.id))
    .where(eq(teamThemes.teamId, team.id))
    .limit(1)

  const accentColor = teamThemeData?.accentColor || '#C9A66B'
  const themeMode = teamThemeData?.themeMode || 'dark'
  const themeTokens = (teamThemeData?.tokensJson as any) || {}
  const backgroundColor = themeTokens?.colors?.background || (themeMode === 'dark' ? '#0f172a' : '#ffffff')

  return (
    <PublicHubClient
      teamName={team.name}
      teamSlug={team.slug}
      teamId={team.id}
      hubTitle={hubPage.title}
      blocks={blocks as any}
      accentColor={accentColor}
      themeMode={themeMode}
      backgroundColor={backgroundColor}
    />
  )
}
