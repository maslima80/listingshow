'use client'

import { HubBlock } from '@/lib/types/hub-blocks'
import { BlockRenderer } from './block-renderer'

interface PublicHubClientProps {
  teamName: string
  teamSlug: string
  teamId: string
  hubTitle: string
  blocks: HubBlock[]
  accentColor: string
  themeMode: 'dark' | 'light'
  backgroundColor: string
}

export function PublicHubClient({
  teamName,
  teamSlug,
  teamId,
  hubTitle,
  blocks,
  accentColor,
  themeMode,
  backgroundColor
}: PublicHubClientProps) {
  const isDark = themeMode === 'dark'

  return (
    <div 
      className={`min-h-screen ${isDark ? 'dark' : ''}`}
      style={{ 
        backgroundColor,
        '--accent-color': accentColor,
      } as React.CSSProperties}
    >
      {/* Render all blocks */}
      <div>
        {blocks.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center py-16 px-6">
              <h1 className="text-4xl font-bold mb-4">{teamName}</h1>
              <p className="text-muted-foreground">
                No content available yet
              </p>
            </div>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              teamSlug={teamSlug}
              teamId={teamId}
              teamName={teamName}
              isPreview={false}
            />
          ))
        )}
      </div>
    </div>
  )
}
