'use client'

import { AboutBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useState } from 'react'

interface AboutBlockProps {
  settings: AboutBlockSettings
  isPreview?: boolean
}

export function AboutBlock({ settings, isPreview = false }: AboutBlockProps) {
  const {
    photoUrl,
    bioShort,
    bioLong,
    videoUrl,
    showStats,
    stats,
    showCredentials,
    credentials,
    ctaText,
    ctaLink,
    layout = 'left',
  } = settings

  const [showVideo, setShowVideo] = useState(false)

  const layoutClass = {
    left: 'md:flex-row',
    right: 'md:flex-row-reverse',
    center: 'flex-col items-center text-center',
  }[layout]

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`flex flex-col ${layoutClass} gap-12 items-center`}
        >
          {/* Photo/Video Side */}
          <div className="flex-shrink-0">
            <div className="relative">
              {photoUrl && (
                <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Video overlay */}
                  {videoUrl && !showVideo && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/50 transition-colors"
                      disabled={isPreview}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Video player */}
              {showVideo && videoUrl && (
                <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Side */}
          <div className="flex-1 space-y-6">
            {/* Bio */}
            <div className="space-y-4">
              {bioShort && (
                <p className="text-2xl font-light text-muted-foreground leading-relaxed">
                  {bioShort}
                </p>
              )}
              
              {bioLong && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {bioLong}
                </p>
              )}
            </div>

            {/* Stats */}
            {showStats && stats && (
              <div className="grid grid-cols-3 gap-6 py-6 border-y">
                {stats.years && (
                  <div>
                    <div className="text-4xl font-bold text-primary">
                      {stats.years}+
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Years Experience
                    </div>
                  </div>
                )}
                
                {stats.homesSold && (
                  <div>
                    <div className="text-4xl font-bold text-primary">
                      {stats.homesSold}+
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Homes Sold
                    </div>
                  </div>
                )}
                
                {stats.volume && (
                  <div>
                    <div className="text-4xl font-bold text-primary">
                      {stats.volume}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Sales Volume
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Credentials */}
            {showCredentials && credentials && credentials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {credentials.map((credential, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {credential}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTA */}
            {ctaText && ctaLink && (
              <div>
                <Button
                  size="lg"
                  onClick={() => !isPreview && window.open(ctaLink, '_blank')}
                  disabled={isPreview}
                >
                  {ctaText}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
