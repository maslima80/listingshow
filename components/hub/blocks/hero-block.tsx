'use client'

import { useState } from 'react'
import { HeroBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ContactModal, ScheduleTourModal, ValuationModal } from '../cta-modals'

interface HeroBlockProps {
  settings: HeroBlockSettings
  teamId?: string
  isPreview?: boolean
}

// Overlay gradient presets (bottom-up scrim for cinematic effect)
const OVERLAY_PRESETS = {
  light: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.00) 50%)',
  balanced: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.00) 50%)',
  dark: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.10) 50%)',
}

export function HeroBlock({ settings, teamId, isPreview = false }: HeroBlockProps) {
  const [contactOpen, setContactOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [valuationOpen, setValuationOpen] = useState(false)

  const {
    headline,
    tagline,
    backgroundImage,
    overlay = 'balanced',
    textAlign = 'center',
    primaryCta,
    secondaryCta,
    showAgencyLogo = false,
  } = settings

  // Validation: must have headline and background image
  const isComplete = headline && backgroundImage?.url

  // Show placeholder in editor if incomplete
  if (!isComplete && isPreview) {
    return (
      <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center px-6">
          <div className="text-4xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold mb-2">Hero Section</h3>
          <p className="text-muted-foreground">
            Add a background image to publish this section.
          </p>
        </div>
      </section>
    )
  }

  // Hide on public if incomplete
  if (!isComplete && !isPreview) {
    return null
  }

  // Text alignment classes (mobile always center, bottom-aligned for cinematic effect)
  const desktopAlignClass = {
    left: 'md:text-left md:items-start',
    center: 'md:text-center md:items-center',
    right: 'md:text-right md:items-end',
  }[textAlign]
  
  // Always bottom-aligned for movie poster effect
  const verticalAlignClass = 'items-end justify-end'

  const handleCtaClick = (action: any) => {
    if (isPreview) return

    switch (action.type) {
      case 'anchor':
        // Smooth scroll to section
        if (action.value) {
          const element = document.querySelector(action.value)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          } else {
            // Section doesn't exist yet - scroll to bottom as fallback
            console.warn(`Section ${action.value} not found on page`)
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          }
        }
        break
      case 'contact':
        setContactOpen(true)
        break
      case 'schedule':
        setScheduleOpen(true)
        break
      case 'valuation':
        setValuationOpen(true)
        break
      case 'mortgage':
        // Scroll to mortgage calculator
        const calc = document.querySelector('#mortgage-calculator')
        if (calc) {
          calc.scrollIntoView({ behavior: 'smooth' })
        } else {
          console.warn('Mortgage calculator block not found on page')
        }
        break
      case 'url':
        if (action.value) {
          window.open(action.value, '_blank', 'noopener,noreferrer')
        }
        break
    }
  }

  // Responsive ImageKit transforms
  const getResponsiveImageUrl = (baseUrl: string) => {
    return {
      mobile: `${baseUrl}?tr=w-1080,h-1920,fo-auto`,
      tablet: `${baseUrl}?tr=w-1280,h-800,fo-auto`,
      desktop: `${baseUrl}?tr=w-1920,h-1080,fo-auto`,
    }
  }

  const imageUrls = backgroundImage?.url ? getResponsiveImageUrl(backgroundImage.url) : null

  return (
    <>
      <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden" style={{ '--accent-color': 'var(--accent-color, #C9A66B)' } as React.CSSProperties}>
        {/* Background Image with Ken Burns effect */}
        {imageUrls && (
          <picture className="absolute inset-0">
            <source
              media="(max-width: 640px)"
              srcSet={imageUrls.mobile}
            />
            <source
              media="(max-width: 1024px)"
              srcSet={imageUrls.tablet}
            />
            <img
              src={imageUrls.desktop}
              alt={backgroundImage.alt || 'Hero background'}
              className="w-full h-full object-cover motion-safe:animate-ken-burns"
            />
          </picture>
        )}

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: OVERLAY_PRESETS[overlay] }}
        />

        {/* Content Container - Lower third positioning for cinematic effect */}
        <div className={`relative z-10 w-full h-full flex flex-col ${verticalAlignClass}`}>
          <div className={`w-full max-w-5xl mx-auto px-6 md:px-12 pb-20 md:pb-24 flex flex-col items-center text-center ${desktopAlignClass}`}>
            {/* Headline - The Star */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white font-bold"
              style={{
                fontSize: 'clamp(32px, 6vw, 64px)',
                lineHeight: '1.1',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em',
              }}
            >
              {headline}
            </motion.h1>

            {/* Tagline - Small space (0.5rem / 8px) */}
            {tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/95 mt-2 max-w-2xl"
                style={{
                  fontSize: 'clamp(16px, 2.5vw, 22px)',
                  lineHeight: '1.4',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  fontWeight: '400',
                }}
              >
                {tagline}
              </motion.p>
            )}

            {/* CTAs - Large space (1.5rem / 24px) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-6"
            >
              {/* Primary CTA */}
              <Button
                size="lg"
                className="text-sm sm:text-base px-10 sm:px-12 py-5 sm:py-6 w-full sm:w-auto font-medium tracking-wider uppercase shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                onClick={() => handleCtaClick(primaryCta.action)}
                disabled={isPreview}
              >
                {primaryCta.label}
              </Button>

              {/* Secondary CTA */}
              {secondaryCta?.enabled && secondaryCta.label && secondaryCta.action && (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm sm:text-base px-10 sm:px-12 py-5 sm:py-6 w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-medium tracking-wider uppercase transition-all"
                  onClick={() => handleCtaClick(secondaryCta.action)}
                  disabled={isPreview}
                >
                  {secondaryCta.label}
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - subtle hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1 h-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Modals */}
      <ContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        teamId={teamId}
        source="hero_cta"
      />
      <ScheduleTourModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        teamId={teamId}
        source="hero_cta"
      />
      <ValuationModal
        open={valuationOpen}
        onOpenChange={setValuationOpen}
        teamId={teamId}
        source="hero_cta"
      />
    </>
  )
}
