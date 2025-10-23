'use client'

import { HeroBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface HeroBlockProps {
  settings: HeroBlockSettings
  isPreview?: boolean
}

export function HeroBlock({ settings, isPreview = false }: HeroBlockProps) {
  const {
    backgroundType,
    backgroundUrl,
    gradientFrom = '#000000',
    gradientTo = '#1a1a1a',
    headline,
    tagline,
    showLogo,
    logoUrl,
    ctaText,
    ctaLink,
    textPosition = 'center',
    overlayOpacity = 0.4,
    textColor = '#ffffff',
  } = settings

  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[textPosition]

  const handleCtaClick = () => {
    if (isPreview) return
    if (ctaLink) {
      if (ctaLink.startsWith('#')) {
        // Smooth scroll to section
        const element = document.querySelector(ctaLink)
        element?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = ctaLink
      }
    }
  }

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundType === 'video' && backgroundUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video>
      )}

      {backgroundType === 'image' && backgroundUrl && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}

      {backgroundType === 'gradient' && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 flex flex-col gap-6 ${textAlignClass}`}>
        {/* Logo */}
        {showLogo && logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight"
          style={{ color: textColor }}
        >
          {headline}
        </motion.h1>

        {/* Tagline */}
        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl font-light max-w-2xl"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {tagline}
          </motion.p>
        )}

        {/* CTA */}
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full"
              onClick={handleCtaClick}
              disabled={isPreview}
            >
              {ctaText}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 rounded-full flex items-start justify-center p-2"
          style={{ borderColor: textColor, opacity: 0.5 }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: textColor }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
