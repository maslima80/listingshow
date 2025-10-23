'use client'

import { Building2, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Block {
  id: string
  type: 'property' | 'link' | 'image' | 'video' | 'text'
  title?: string | null
  subtitle?: string | null
  url?: string | null
  mediaUrl?: string | null
  property?: {
    id: string
    title: string
    slug: string
  } | null
}

interface HubPreviewProps {
  blocks: Block[]
  teamSlug: string
  accentColor: string
  themeMode: 'dark' | 'light'
}

export function HubPreview({ blocks, teamSlug, accentColor, themeMode }: HubPreviewProps) {
  const isDark = themeMode === 'dark'

  return (
    <div 
      className={`min-h-[600px] max-h-[800px] overflow-y-auto p-6 ${
        isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">@{teamSlug}</h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Premium Real Estate
        </p>
      </div>

      {/* Blocks */}
      <div className="space-y-4 max-w-md mx-auto">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No blocks yet. Add some to see them here!
            </p>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id}>
              {block.type === 'property' && block.property && (
                <a
                  href={`/p/${block.property.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card 
                    className={`p-4 hover:scale-[1.02] transition-transform cursor-pointer ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
                    }`}
                    style={{ borderColor: accentColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <Building2 className="h-6 w-6" style={{ color: accentColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{block.property.title}</h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          View Property
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                  </Card>
                </a>
              )}

              {block.type === 'link' && (
                <a
                  href={block.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card 
                    className={`p-4 hover:scale-[1.02] transition-transform cursor-pointer text-center ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
                    }`}
                  >
                    <h3 className="font-medium">{block.title}</h3>
                  </Card>
                </a>
              )}

              {block.type === 'text' && (
                <Card className={`p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <h3 className="font-medium mb-2">{block.title}</h3>
                  {block.subtitle && (
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {block.subtitle}
                    </p>
                  )}
                </Card>
              )}

              {block.type === 'image' && block.mediaUrl && (
                <Card className={`overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <img 
                    src={block.mediaUrl} 
                    alt={block.title || 'Image'} 
                    className="w-full h-auto"
                  />
                  {block.title && (
                    <div className="p-3">
                      <p className="text-sm font-medium">{block.title}</p>
                    </div>
                  )}
                </Card>
              )}

              {block.type === 'video' && block.url && (
                <Card className={`p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                  <h3 className="font-medium mb-3">{block.title}</h3>
                  <div className="aspect-video bg-slate-200 rounded flex items-center justify-center">
                    <p className="text-sm text-slate-500">Video Preview</p>
                  </div>
                </Card>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
