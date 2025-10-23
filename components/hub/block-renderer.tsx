'use client'

import { HubBlock, HubBlockType } from '@/lib/types/hub-blocks'
import { HeroBlock } from './blocks/hero-block'
import { AboutBlock } from './blocks/about-block'
import { NeighborhoodsBlock } from './blocks/neighborhoods-block'
import { TestimonialsBlock } from './blocks/testimonials-block'
import { ContactBlock } from './blocks/contact-block'
import { ValuationBlock } from './blocks/valuation-block'
import { LeadMagnetBlock } from './blocks/lead-magnet-block'
import { PropertiesBlock } from './blocks/properties-block'
import { SocialFooterBlock } from './blocks/social-footer-block'

interface BlockRendererProps {
  block: HubBlock
  teamSlug: string
  teamId?: string
  teamName?: string
  isPreview?: boolean
}

/**
 * Central Block Renderer
 * Routes each block type to its corresponding component
 */
export function BlockRenderer({
  block,
  teamSlug,
  teamId,
  teamName,
  isPreview = false,
}: BlockRendererProps) {
  // Don't render hidden blocks (unless in preview mode)
  if (!block.isVisible && !isPreview) {
    return null
  }

  const settings = block.settingsJson as any

  // Render based on block type
  switch (block.type) {
    case 'hero':
      return <HeroBlock settings={settings} isPreview={isPreview} />

    case 'about':
      return <AboutBlock settings={settings} isPreview={isPreview} />

    case 'properties':
      return (
        <PropertiesBlock
          settings={settings}
          teamSlug={teamSlug}
          isPreview={isPreview}
        />
      )

    case 'neighborhoods':
      return (
        <NeighborhoodsBlock
          settings={settings}
          teamSlug={teamSlug}
          isPreview={isPreview}
        />
      )

    case 'testimonials':
      return <TestimonialsBlock settings={settings} isPreview={isPreview} />

    case 'valuation':
      return (
        <ValuationBlock
          settings={settings}
          teamId={teamId}
          isPreview={isPreview}
        />
      )

    case 'lead_magnet':
      return <LeadMagnetBlock settings={settings} isPreview={isPreview} />

    case 'contact':
      return (
        <ContactBlock
          settings={settings}
          teamId={teamId}
          isPreview={isPreview}
        />
      )

    case 'social_footer':
      return (
        <SocialFooterBlock
          settings={settings}
          teamName={teamName}
          isPreview={isPreview}
        />
      )

    // Legacy/Simple blocks (from original hub)
    case 'property':
      return (
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <a
              href={isPreview ? '#' : `/p/${block.url}`}
              className="block p-6 rounded-xl border hover:border-primary transition-colors"
            >
              <h3 className="text-xl font-semibold">{block.title}</h3>
              {block.subtitle && (
                <p className="text-muted-foreground mt-2">{block.subtitle}</p>
              )}
            </a>
          </div>
        </div>
      )

    case 'link':
      return (
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <a
              href={isPreview ? '#' : block.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => isPreview && e.preventDefault()}
              className="flex items-center justify-between p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div>
                <div className="font-semibold">{block.title}</div>
                {block.subtitle && (
                  <div className="text-sm text-muted-foreground">
                    {block.subtitle}
                  </div>
                )}
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {block.mediaUrl && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={block.mediaUrl}
                  alt={block.title || 'Image'}
                  className="w-full h-auto"
                />
                {block.title && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {block.title}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )

    case 'video':
      return (
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {block.mediaUrl && (
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={block.mediaUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            )}
            {block.title && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {block.title}
              </p>
            )}
          </div>
        </div>
      )

    case 'text':
      return (
        <div className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            {block.title && <h2>{block.title}</h2>}
            {block.subtitle && (
              <div dangerouslySetInnerHTML={{ __html: block.subtitle }} />
            )}
          </div>
        </div>
      )

    case 'spacer':
      const height = (settings?.height as number) || 40
      return <div style={{ height: `${height}px` }} />

    default:
      // Unknown block type
      if (isPreview) {
        return (
          <div className="py-12 px-6">
            <div className="max-w-4xl mx-auto p-6 border border-dashed rounded-xl text-center text-muted-foreground">
              Unknown block type: {block.type}
            </div>
          </div>
        )
      }
      return null
  }
}
