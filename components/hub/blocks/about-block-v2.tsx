'use client'

import { useState, useEffect } from 'react'
import { AboutBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Award, TrendingUp, Home, DollarSign, Facebook, Instagram, Linkedin, Youtube, Twitter, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { ContactModal, ScheduleTourModal, ValuationModal } from '../cta-modals'

interface AboutBlockProps {
  settings: AboutBlockSettings
  teamId?: string
  isPreview?: boolean
}

interface ProfileData {
  name: string
  title?: string
  photoUrl?: string
  bio?: string
  bioLong?: string
  videoUrl?: string
  videoThumbnail?: string
  statsJson?: {
    years?: number
    years_in_business?: number
    homesSold?: number
    homes_sold?: string | number
    volume?: string
  }
  credentials?: string[]
  socialLinks?: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    twitter?: string
    website?: string
  }
}

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  website: Globe,
}

export function AboutBlockV2({ settings, teamId, isPreview = false }: AboutBlockProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [valuationOpen, setValuationOpen] = useState(false)

  const { useProfile, override, show, layout = 'photoLeft', cta } = settings

  // Fetch profile data if useProfile is true
  useEffect(() => {
    if (useProfile && teamId && !isPreview) {
      setLoading(true)
      fetch(`/api/profile?teamId=${teamId}`)
        .then(res => res.json())
        .then(data => {
          setProfileData(data.profile)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [teamId, useProfile, isPreview])

  // Determine what data to use (profile or override)
  const data = useProfile ? profileData : {
    name: override?.fullName || '',
    title: override?.title || '',
    photoUrl: override?.photoUrl || '',
    bio: override?.shortBio || '',
    bioLong: override?.extendedBio || '',
    videoUrl: override?.videoAssetId || '',
    statsJson: override?.stats,
    credentials: override?.credentials,
    socialLinks: {},
  }

  // Validation: has required content
  const hasRequiredContent = Boolean(
    data?.name && (data?.bio || data?.bioLong) ||
    data?.credentials && data.credentials.length > 0 ||
    data?.statsJson && (data.statsJson.years || data.statsJson.homesSold || data.statsJson.volume)
  )

  // Show placeholder in editor if incomplete
  if (!hasRequiredContent && isPreview) {
    return (
      <section className="w-full py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-2xl font-semibold mb-3">About Me</h3>
          <p className="text-muted-foreground mb-6">
            {useProfile 
              ? 'Complete your Profile to show this section.'
              : 'Add your name and bio to publish this section.'}
          </p>
          <p className="text-sm text-muted-foreground">
            This block won't appear publicly until content is added.
          </p>
        </div>
      </section>
    )
  }

  // Hide on public if incomplete
  if (!hasRequiredContent && !isPreview) {
    return null
  }

  if (loading) {
    return (
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </section>
    )
  }

  // Handle CTA click
  const handleCtaClick = () => {
    if (isPreview || !cta?.action) return

    switch (cta.action.type) {
      case 'contact':
        setContactOpen(true)
        break
      case 'schedule':
        setScheduleOpen(true)
        break
      case 'valuation':
        setValuationOpen(true)
        break
      case 'anchor':
        if (cta.action.value) {
          const element = document.querySelector(cta.action.value)
          element?.scrollIntoView({ behavior: 'smooth' })
        }
        break
      case 'url':
        if (cta.action.value) {
          window.open(cta.action.value, '_blank', 'noopener,noreferrer')
        }
        break
    }
  }

  // Normalize stats (handle different field name variations)
  const normalizedStats = data?.statsJson ? {
    years: data.statsJson.years || (data.statsJson as any).years_in_business || (data.statsJson as any).yearsExperience,
    homesSold: data.statsJson.homesSold || (data.statsJson as any).homes_sold,
    volume: data.statsJson.volume || (data.statsJson as any).salesVolume,
  } : null

  // Truncate bio for "Read more" functionality
  const bioText = show.extendedBio ? data?.bioLong : data?.bio
  const shouldTruncate = bioText && bioText.length > 400
  const displayBio = shouldTruncate && !bioExpanded 
    ? bioText.substring(0, 400) + '...' 
    : bioText

  // Render content section (reusable for both layouts)
  const renderContent = (centered = false) => (
    <>
      {/* Credentials */}
      {show.credentials && data?.credentials && data.credentials.length > 0 && (
        <div className={`flex flex-wrap gap-2 mb-4 ${centered ? 'justify-center' : ''}`}>
          {data.credentials.map((credential: string, index: number) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-3 py-1"
            >
              <Award className="w-3 h-3 mr-1" />
              {credential}
            </Badge>
          ))}
        </div>
      )}

      {/* Name (H2) */}
      {data?.name && (
        <h2 
          className="font-bold mb-2 leading-tight"
          style={{
            fontSize: 'clamp(22px, 2.6vw, 34px)',
          }}
        >
          {data.name}
        </h2>
      )}

      {/* Title */}
      {data?.title && (
        <p className="text-muted-foreground mb-6 text-lg">
          {data.title}
        </p>
      )}

      {/* Bio */}
      {(show.shortBio || show.extendedBio) && bioText && (
        <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
          <p className="text-muted-foreground leading-relaxed">
            {displayBio}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setBioExpanded(!bioExpanded)}
              className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
            >
              {bioExpanded ? (
                <>Show less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Read more <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      {show.stats && normalizedStats && (
        <div className={`grid grid-cols-3 gap-4 md:gap-6 mb-8 py-6 border-y border-slate-200 dark:border-slate-800 ${centered ? 'max-w-2xl mx-auto w-full' : ''}`}>
          {normalizedStats.years && (
            <div className={centered ? 'text-center' : 'text-center md:text-left'}>
              <div className={`flex items-center ${centered ? 'justify-center' : 'justify-center md:justify-start'} mb-1`}>
                <TrendingUp className="w-5 h-5 text-primary mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {normalizedStats.years}+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                Years
              </div>
            </div>
          )}
          {normalizedStats.homesSold && (
            <div className={centered ? 'text-center' : 'text-center md:text-left'}>
              <div className={`flex items-center ${centered ? 'justify-center' : 'justify-center md:justify-start'} mb-1`}>
                <Home className="w-5 h-5 text-primary mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {normalizedStats.homesSold}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                Homes Sold
              </div>
            </div>
          )}
          {normalizedStats.volume && (
            <div className={centered ? 'text-center' : 'text-center md:text-left'}>
              <div className={`flex items-center ${centered ? 'justify-center' : 'justify-center md:justify-start'} mb-1`}>
                <DollarSign className="w-5 h-5 text-primary mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">
                {normalizedStats.volume}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                Volume
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Links */}
      {show.socialLinks && data?.socialLinks && Object.keys(data.socialLinks).length > 0 && (
        <div className={`flex gap-4 mb-8 ${centered ? 'justify-center' : ''}`}>
          {Object.entries(data.socialLinks).map(([platform, url]) => {
            if (!url) return null
            const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS]
            if (!Icon) return null
            
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            )
          })}
        </div>
      )}

      {/* CTA */}
      {cta?.enabled && cta.label && (
        <div className={centered ? 'flex justify-center' : ''}>
          <Button
            size="lg"
            className="text-sm px-10 py-5 uppercase tracking-wider font-medium"
            style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
            onClick={handleCtaClick}
            disabled={isPreview}
          >
            {cta.label}
          </Button>
        </div>
      )}
    </>
  )

  return (
    <>
      <section className="w-full py-16 md:py-24 px-6 bg-white dark:bg-slate-950">
        {/* Photo Top Layout - Full width photo, centered content */}
        {layout === 'photoTop' && (
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            {/* Photo/Video */}
            {show.photo && data?.photoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md mb-8"
              >
                {show.videoIntro && data?.videoUrl && !videoPlaying ? (
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg group cursor-pointer">
                    <img
                      src={data.photoUrl}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <button
                        onClick={() => setVideoPlaying(true)}
                        className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
                      >
                        <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : show.videoIntro && data?.videoUrl && videoPlaying ? (
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                    <video
                      src={data.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={data.photoUrl}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              {renderContent(true)}
            </motion.div>
          </div>
        )}

        {/* Photo Left Layout - Compact card with small circular photo */}
        {layout === 'photoLeft' && (
          <div className="max-w-4xl mx-auto">
            {/* Mobile: Photo + Name/Title side by side */}
            <div className="md:hidden mb-6">
              <div className="flex gap-4 items-start mb-6">
                {/* Small photo on left */}
                {show.photo && data?.photoUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="w-24 h-24 flex-shrink-0"
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-white dark:border-slate-800">
                      <img
                        src={data.photoUrl}
                        alt={data.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Credentials, Name, Title stacked on right */}
                <div className="flex-1 min-w-0">
                  {/* Credentials */}
                  {show.credentials && data?.credentials && data.credentials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {data.credentials.map((credential: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {credential}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Name */}
                  {data?.name && (
                    <h2 className="font-bold text-xl leading-tight mb-1">
                      {data.name}
                    </h2>
                  )}

                  {/* Title */}
                  {data?.title && (
                    <p className="text-muted-foreground text-sm">
                      {data.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Rest of content below */}
              <div>
                {/* Bio */}
                {(show.shortBio || show.extendedBio) && bioText && (
                  <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {displayBio}
                    </p>
                    {shouldTruncate && (
                      <button
                        onClick={() => setBioExpanded(!bioExpanded)}
                        className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                      >
                        {bioExpanded ? (
                          <>Show less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Read more <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Stats */}
                {show.stats && normalizedStats && (
                  <div className="grid grid-cols-3 gap-4 mb-6 py-6 border-y border-slate-200 dark:border-slate-800">
                    {normalizedStats.years && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-5 h-5 text-primary mr-2" />
                        </div>
                        <div className="text-2xl font-bold">
                          {normalizedStats.years}+
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          Years
                        </div>
                      </div>
                    )}
                    {normalizedStats.homesSold && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Home className="w-5 h-5 text-primary mr-2" />
                        </div>
                        <div className="text-2xl font-bold">
                          {normalizedStats.homesSold}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          Homes Sold
                        </div>
                      </div>
                    )}
                    {normalizedStats.volume && (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-5 h-5 text-primary mr-2" />
                        </div>
                        <div className="text-2xl font-bold">
                          {normalizedStats.volume}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          Volume
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {show.socialLinks && data?.socialLinks && Object.keys(data.socialLinks).length > 0 && (
                  <div className="flex gap-4 mb-6">
                    {Object.entries(data.socialLinks).map(([platform, url]) => {
                      if (!url) return null
                      const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS]
                      if (!Icon) return null
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      )
                    })}
                  </div>
                )}

                {/* CTA */}
                {cta?.enabled && cta.label && (
                  <div>
                    <Button
                      size="lg"
                      className="text-sm px-10 py-5 uppercase tracking-wider font-medium w-full"
                      style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                      onClick={handleCtaClick}
                      disabled={isPreview}
                    >
                      {cta.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Photo on left, all content on right */}
            <div className="hidden md:flex gap-6 items-start">
              {/* Photo - Small circular card style */}
              {show.photo && data?.photoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="w-48 flex-shrink-0"
                >
                  <div className="relative aspect-square rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
                    <img
                      src={data.photoUrl}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 flex flex-col justify-center"
              >
                {renderContent(false)}
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* CTA Modals */}
      <ContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        teamId={teamId}
        source="about_cta"
      />
      <ScheduleTourModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        teamId={teamId}
        source="about_cta"
      />
      <ValuationModal
        open={valuationOpen}
        onOpenChange={setValuationOpen}
        teamId={teamId}
        source="about_cta"
      />
    </>
  )
}
