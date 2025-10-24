'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ContactModal, ScheduleTourModal } from '@/components/hub/cta-modals'
import { toast } from '@/hooks/use-toast'
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
  ExternalLink,
} from 'lucide-react'

interface ProfileData {
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  calendlyUrl?: string | null
  useInternalScheduling?: boolean
  socialLinks?: Record<string, string | null>
  brokerageName?: string | null
  licenseNumber?: string | null
  disclosureText?: string | null
  accentColor?: string | null
}

interface ContactBlockProps {
  settings: ContactBlockSettings
  teamId?: string
  teamSlug?: string
  isPreview?: boolean
}

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  website: Globe,
}

function buildWhatsappLink(number?: string | null, message?: string) {
  if (!number) return '#'
  const digits = number.replace(/\D/g, '')
  const text = encodeURIComponent(message || 'Hi! I would love to chat about real estate opportunities.')
  return `https://wa.me/${digits}?text=${text}`
}

const HONEYPOT_FIELD = 'website'

export function ContactBlock({
  settings,
  teamId,
  teamSlug,
  isPreview = false,
}: ContactBlockProps) {
  const {
    headline,
    subline,
    layout,
    actions,
    labels,
    form,
    schedule,
    showSocialLinks,
    showCompliance,
    anchorId = 'contact',
    hideHeading,
  } = settings

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(Boolean(teamId) && !isPreview)
  const [contactOpen, setContactOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [inlineSubmitting, setInlineSubmitting] = useState(false)
  const [inlineSuccess, setInlineSuccess] = useState(false)
  const [inlineForm, setInlineForm] = useState({ name: '', email: '', phone: '', message: '', [HONEYPOT_FIELD]: '' })

  useEffect(() => {
    if (!teamId || isPreview) {
      setLoadingProfile(false)
      return
    }

    setLoadingProfile(true)
    fetch(`/api/profile?teamId=${teamId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile)
        setLoadingProfile(false)
      })
      .catch(err => {
        console.error('Failed to load profile for contact block:', err)
        setLoadingProfile(false)
      })
  }, [teamId, isPreview])

  const computedActions = useMemo(() => {
    const data = profile || {}
    const canScheduleInternal = data.useInternalScheduling !== false
    return {
      email: actions.showEmail && (data.email || !teamId),
      call: actions.showCall && (data.phone || !teamId),
      schedule: actions.showSchedule && canScheduleInternal,
      whatsapp: actions.showWhatsapp && (data.whatsapp || !teamId),
    }
  }, [actions, profile, teamId])

  const accentColor = profile?.accentColor || 'var(--accent-color, #C9A66B)'

  const submitInlineForm = async () => {
    if (isPreview) return
    if (inlineForm[HONEYPOT_FIELD]) {
      toast({
        title: 'Form not sent',
        description: 'Please contact us directly via phone or email.',
        variant: 'destructive',
      })
      return
    }
    setInlineSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          source: 'contact_block',
          name: inlineForm.name,
          email: inlineForm.email,
          phone: inlineForm.phone || undefined,
          message: inlineForm.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      setInlineSuccess(true)
      setInlineForm({ name: '', email: '', phone: '', message: '', [HONEYPOT_FIELD]: '' })
      toast({
        title: "Thanks! We'll be in touch shortly.",
      })
    } catch (error) {
      console.error('Contact block form error:', error)
      toast({
        title: 'Error',
        description: 'Could not send your message. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setInlineSubmitting(false)
      setTimeout(() => setInlineSuccess(false), 4000)
    }
  }

  const renderActionButton = (type: 'email' | 'call' | 'schedule' | 'whatsapp') => {
    if (!computedActions[type]) return null

    const data = profile || {}
    const iconMap = {
      email: Mail,
      call: Phone,
      schedule: Calendar,
      whatsapp: MessageSquare,
    }
    const Icon = iconMap[type]
    const label = labels[type]

    const baseClasses = cn(
      'group relative overflow-hidden rounded-full px-6 py-4 font-semibold text-base transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'bg-[var(--accent-color,_#C9A66B)] text-white hover:scale-[1.02] active:scale-[0.99] shadow-lg shadow-black/10'
    )

    const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (isPreview) {
        event.preventDefault()
        return
      }

      if (type === 'email') {
        setContactOpen(true)
      } else if (type === 'schedule') {
        setScheduleOpen(true)
      } else if (type === 'call') {
        if (!data.phone) {
          toast({ title: 'Phone number not available', variant: 'destructive' })
        }
      } else if (type === 'whatsapp') {
        if (!data.whatsapp) {
          toast({ title: 'WhatsApp number not available', variant: 'destructive' })
        }
      }
    }

    if (type === 'call' && data.phone) {
      return (
        <a
          key={type}
          href={`tel:${data.phone}`}
          onClick={handleClick}
          className={baseClasses}
          aria-label={label}
        >
          <span className="flex items-center justify-center gap-2">
            <Icon className="h-5 w-5" />
            {label}
          </span>
        </a>
      )
    }

    if (type === 'whatsapp' && data.whatsapp) {
      return (
        <a
          key={type}
          href={buildWhatsappLink(data.whatsapp, `Hi ${profile?.name || ''}! I'm interested in your services.`)}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          aria-label={label}
        >
          <span className="flex items-center justify-center gap-2">
            <Icon className="h-5 w-5" />
            {label}
            <ExternalLink className="h-4 w-4 opacity-80" />
          </span>
        </a>
      )
    }

    return (
      <Button
        key={type}
        onClick={handleClick}
        className={baseClasses}
        aria-label={label}
      >
        <span className="flex items-center justify-center gap-2">
          <Icon className="h-5 w-5" />
          {label}
        </span>
      </Button>
    )
  }

  const renderButtonsRow = () => {
    const buttons = (
      <div className="flex flex-wrap gap-4 justify-center">
        {renderActionButton('schedule')}
        {renderActionButton('email')}
        {renderActionButton('call')}
        {renderActionButton('whatsapp')}
      </div>
    )
    return buttons
  }

  const renderInlineForm = () => {
    if (!form.show || form.mode !== 'inline') return null

    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/60 backdrop-blur-md shadow-xl dark:bg-slate-900/60 mt-10">
        <form
          className="grid gap-4 p-8 md:p-10"
          onSubmit={(e) => {
            e.preventDefault()
            submitInlineForm()
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Name *</label>
              <Input
                value={inlineForm.name}
                onChange={(e) => setInlineForm(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={inlineSubmitting || isPreview}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Email *</label>
              <Input
                type="email"
                value={inlineForm.email}
                onChange={(e) => setInlineForm(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={inlineSubmitting || isPreview}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                Phone{form.requirePhone ? ' *' : ''}
              </label>
              <Input
                type="tel"
                value={inlineForm.phone}
                onChange={(e) => setInlineForm(prev => ({ ...prev, phone: e.target.value }))}
                required={form.requirePhone}
                disabled={inlineSubmitting || isPreview}
              />
            </div>
            <div className="hidden">
              <label className="sr-only" htmlFor={HONEYPOT_FIELD}>Leave this field blank</label>
              <Input
                id={HONEYPOT_FIELD}
                value={(inlineForm as any)[HONEYPOT_FIELD]}
                onChange={(e) => setInlineForm(prev => ({ ...prev, [HONEYPOT_FIELD]: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Message *</label>
            <Textarea
              value={inlineForm.message}
              onChange={(e) => setInlineForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder={form.messagePlaceholder || "I'm interested in this…"}
              rows={4}
              required
              disabled={inlineSubmitting || isPreview}
            />
          </div>

          {form.consentLabel && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <input type="checkbox" required disabled={inlineSubmitting || isPreview} className="mt-1" />
              <span>{form.consentLabel}</span>
            </div>
          )}

          <Button
            type="submit"
            className="rounded-full py-5 font-semibold"
            disabled={inlineSubmitting || isPreview}
            style={{ backgroundColor: accentColor }}
          >
            {inlineSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : inlineSuccess ? (
              'Message Sent!'
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </div>
    )
  }

  const renderSocialLinks = () => {
    if (!showSocialLinks || !profile?.socialLinks) return null
    const entries = Object.entries(profile.socialLinks).filter(([, value]) => value)
    if (entries.length === 0) return null

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 mt-10 text-sm text-muted-foreground">
        {entries.map(([key, value]) => {
          const Icon = SOCIAL_ICON_MAP[key.toLowerCase()]
          if (!Icon || !value) return null
          return (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{key}</span>
            </a>
          )
        })}
      </div>
    )
  }

  const renderCompliance = () => {
    if (!showCompliance) return null
    const hasCompliance = profile?.brokerageName || profile?.licenseNumber || profile?.disclosureText
    if (!hasCompliance) return null

    return (
      <div className="mt-8 text-xs text-muted-foreground text-center space-y-1">
        {profile?.brokerageName && <p>{profile.brokerageName}</p>}
        {profile?.licenseNumber && <p>License #{profile.licenseNumber}</p>}
        {profile?.disclosureText && <p>{profile.disclosureText}</p>}
      </div>
    )
  }

  const renderScheduleModal = () => (
    <ScheduleTourModal
      open={scheduleOpen}
      onOpenChange={setScheduleOpen}
      teamId={teamId}
      source="contact_block"
      title={schedule.title}
      timeWindows={schedule.timeWindows}
      dateLabel={schedule.dateLabel}
      noteLabel={schedule.noteLabel}
    />
  )

  const renderContactModal = () => (
    <ContactModal
      open={contactOpen}
      onOpenChange={setContactOpen}
      teamId={teamId}
      source="contact_block"
      messagePlaceholder={form.messagePlaceholder}
      requirePhone={form.requirePhone}
      consentLabel={form.consentLabel}
    />
  )

  const sectionClasses = cn(
    'relative py-24 px-6 md:px-10',
    'bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white'
  )

  return (
    <section id={anchorId} className={sectionClasses}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        {!hideHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-slate-200/80">Contact</p>
            <h2 className="text-4xl md:text-5xl font-semibold leading-tight">{headline}</h2>
            {subline && <p className="text-lg text-slate-200/80 max-w-3xl mx-auto">{subline}</p>}
          </motion.div>
        )}

        {layout !== 'form' && (
          <div className="space-y-8">
            {renderButtonsRow()}
          </div>
        )}

        {layout === 'buttons_form' && form.show && form.mode === 'inline' && renderInlineForm()}

        {layout === 'form' && form.show && form.mode === 'inline' && (
          <div className="space-y-8">
            {renderInlineForm()}
            {layout === 'form' && renderButtonsRow()}
          </div>
        )}

        {form.show && form.mode === 'modal' && (
          <div className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <p>Prefer email? Open the form to drop a quick note.</p>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => !isPreview && setContactOpen(true)}
                className="rounded-full px-6 py-3 font-semibold"
                style={{ backgroundColor: accentColor }}
                aria-label={labels.email}
              >
                {labels.email}
              </Button>
            </div>
          </div>
        )}

        {renderSocialLinks()}
        {renderCompliance()}
      </div>

      {form.mode === 'modal' && renderContactModal()}
      {schedule.enabled && renderScheduleModal()}
    </section>
  )
}
