'use client'

import { useState, useEffect } from 'react'
import { AboutBlockSettings, CtaAction } from '@/lib/types/hub-blocks'
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
  statsJson?: {
    years?: number
    homesSold?: number
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

export function AboutBlockNew({ settings, teamId, isPreview = false }: AboutBlockProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bioExpanded, setBioExpanded] = useState(false)
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

  // Layout classes
  const layoutClasses = {
    left: 'md:flex-row',
    right: 'md:flex-row-reverse',
    center: 'md:flex-col md:items-center md:text-center',
  }[layout]

  return (
    <section className="w-full py-16 md:py-24 px-6 bg-white dark:bg-slate-950">
      <div className={`max-w-6xl mx-auto flex flex-col ${layoutClasses} gap-8 md:gap-12`}>
        {/* Photo/Video Column */}
        {(displayPhoto || videoUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-5/12 flex-shrink-0"
          >
            {videoUrl && !videoPlaying ? (
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer">
                {displayPhoto && (
                  <img
                    src={displayPhoto}
                    alt="Agent"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all"
                  >
                    <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>
            ) : videoUrl && videoPlaying ? (
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            ) : displayPhoto ? (
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img
                  src={displayPhoto}
                  alt="Agent"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Content Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Credentials */}
          {showCredentials && displayCredentials && displayCredentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {displayCredentials.map((credential: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-3 py-1 border-current"
                >
                  <Award className="w-3 h-3 mr-1" />
                  {credential}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio Short (Headline) */}
          {displayBioShort && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {displayBioShort}
            </h2>
          )}

          {/* Bio Long */}
          {displayBioLong && (
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              <p className="text-muted-foreground leading-relaxed">
                {displayBioLong}
              </p>
            </div>
          )}

          {/* Stats */}
          {showStats && displayStats && (
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8 py-6 border-y border-slate-200 dark:border-slate-800">
              {displayStats.years && (
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-1">
                    <TrendingUp className="w-5 h-5 text-primary mr-2" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {displayStats.years}+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                    Years
                  </div>
                </div>
              )}
              {displayStats.homesSold && (
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-1">
                    <Home className="w-5 h-5 text-primary mr-2" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {displayStats.homesSold}+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                    Homes Sold
                  </div>
                </div>
              )}
              {displayStats.volume && (
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-1">
                    <DollarSign className="w-5 h-5 text-primary mr-2" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {displayStats.volume}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
                    Volume
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          {ctaText && ctaLink && (
            <div>
              <Button
                size="lg"
                className="text-sm px-10 py-5 uppercase tracking-wider font-medium"
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                onClick={() => !isPreview && window.open(ctaLink, '_blank')}
                disabled={isPreview}
              >
                {ctaText}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
