'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ContactModal, ScheduleTourModal } from '@/components/hub/cta-modals'
import { useToast } from '@/hooks/use-toast'
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
} from 'lucide-react'

interface ProfileData {
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  useInternalScheduling?: boolean
  socialLinks?: Record<string, string | null>
  brokerageName?: string | null
  licenseNumber?: string | null
  disclosureText?: string | null
}

interface ContactBlockProps {
  settings: ContactBlockSettings
  teamId?: string
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
  const text = encodeURIComponent(message || 'Hi! I would love to chat about real estate.')
  return `https://wa.me/${digits}?text=${text}`
}

const HONEYPOT_FIELD = 'website'

export function ContactBlockV2({
  settings,
  teamId,
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
  const [inlineForm, setInlineForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    message: '', 
    [HONEYPOT_FIELD]: '' 
  })

  const { toast } = useToast()

  // Fetch profile data
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
        console.error('Failed to load profile:', err)
        setLoadingProfile(false)
      })
  }, [teamId, isPreview])

  // Determine which actions to show
  const showEmailAction = actions.showEmail && (profile?.email || isPreview)
  const showCallAction = actions.showCall && (profile?.phone || isPreview)
  const showScheduleAction = actions.showSchedule && (profile?.useInternalScheduling !== false || isPreview)
  const showWhatsappAction = actions.showWhatsapp && (profile?.whatsapp || isPreview)

  // Handle inline form submission
  const submitInlineForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return
    
    // Honeypot check
    if (inlineForm[HONEYPOT_FIELD]) {
      toast({
        title: 'Form not sent',
        description: 'Please contact us directly.',
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

      if (!response.ok) throw new Error('Failed to submit')

      setInlineSuccess(true)
      setInlineForm({ name: '', email: '', phone: '', message: '', [HONEYPOT_FIELD]: '' })
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you shortly.",
      })

      setTimeout(() => setInlineSuccess(false), 3000)
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: 'Error',
        description: 'Could not send message. Please try again.',
      })
    } finally {
      setInlineSubmitting(false)
    }
  }

  // Action button handlers
  const handleEmailClick = () => {
    if (isPreview) return
    setContactOpen(true)
  }

  const handleScheduleClick = () => {
    if (isPreview) return
    setScheduleOpen(true)
  }

  // Render action buttons
  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-4 justify-center">
      {showScheduleAction && (
        <Button
          onClick={handleScheduleClick}
          size="lg"
          className="px-8 py-6 text-base font-semibold rounded-full"
          style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
        >
          <Calendar className="mr-2 h-5 w-5" />
          {labels.schedule}
        </Button>
      )}
      
      {showEmailAction && (
        <Button
          onClick={handleEmailClick}
          size="lg"
          className="px-8 py-6 text-base font-semibold rounded-full"
          style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
        >
          <Mail className="mr-2 h-5 w-5" />
          {labels.email}
        </Button>
      )}
      
      {showCallAction && profile?.phone && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="px-8 py-6 text-base font-semibold rounded-full border-2"
        >
          <a href={`tel:${profile.phone}`}>
            <Phone className="mr-2 h-5 w-5" />
            {labels.call}
          </a>
        </Button>
      )}
      
      {showWhatsappAction && profile?.whatsapp && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="px-8 py-6 text-base font-semibold rounded-full border-2"
        >
          <a
            href={buildWhatsappLink(profile.whatsapp, 'Hi! I\'d like to learn more about your services.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {labels.whatsapp}
          </a>
        </Button>
      )}
    </div>
  )

  // Render inline form
  const renderInlineForm = () => {
    if (!form.show || form.mode !== 'inline') return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto mt-12"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-10 border border-slate-200 dark:border-slate-800">
          <form onSubmit={submitInlineForm} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={inlineForm.name}
                  onChange={(e) => setInlineForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={inlineSubmitting || isPreview}
                  className="h-12"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={inlineForm.email}
                  onChange={(e) => setInlineForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={inlineSubmitting || isPreview}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Phone{form.requirePhone ? ' *' : ''}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={inlineForm.phone}
                onChange={(e) => setInlineForm(prev => ({ ...prev, phone: e.target.value }))}
                required={form.requirePhone}
                disabled={inlineSubmitting || isPreview}
                className="h-12"
              />
            </div>

            {/* Honeypot field */}
            <div className="hidden">
              <Label htmlFor={HONEYPOT_FIELD}>Leave blank</Label>
              <Input
                id={HONEYPOT_FIELD}
                value={inlineForm[HONEYPOT_FIELD]}
                onChange={(e) => setInlineForm(prev => ({ ...prev, [HONEYPOT_FIELD]: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                Message *
              </Label>
              <Textarea
                id="message"
                value={inlineForm.message}
                onChange={(e) => setInlineForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder={form.messagePlaceholder || "I'm interested in..."}
                rows={5}
                required
                disabled={inlineSubmitting || isPreview}
                className="resize-none"
              />
            </div>

            {form.consentLabel && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  required
                  disabled={inlineSubmitting || isPreview}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  {form.consentLabel}
                </Label>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full py-6 text-base font-semibold rounded-full"
              disabled={inlineSubmitting || isPreview || inlineSuccess}
              style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
            >
              {inlineSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : inlineSuccess ? (
                'Message Sent!'
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  // Render social links
  const renderSocialLinks = () => {
    if (!showSocialLinks || !profile?.socialLinks) return null
    const entries = Object.entries(profile.socialLinks).filter(([, value]) => value)
    if (entries.length === 0) return null

    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
        {entries.map(([key, value]) => {
          const Icon = SOCIAL_ICON_MAP[key.toLowerCase()]
          if (!Icon || !value) return null
          return (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="capitalize text-sm">{key}</span>
            </a>
          )
        })}
      </div>
    )
  }

  // Render compliance
  const renderCompliance = () => {
    if (!showCompliance) return null
    const hasCompliance = profile?.brokerageName || profile?.licenseNumber || profile?.disclosureText
    if (!hasCompliance) return null

    return (
      <div className="mt-10 text-center space-y-1 text-xs text-muted-foreground">
        {profile?.brokerageName && <p>{profile.brokerageName}</p>}
        {profile?.licenseNumber && <p>License #{profile.licenseNumber}</p>}
        {profile?.disclosureText && <p className="max-w-2xl mx-auto">{profile.disclosureText}</p>}
      </div>
    )
  }

  if (loadingProfile) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </section>
    )
  }

  return (
    <section id={anchorId} className="relative py-24 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {!hideHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h2>
            {subline && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {subline}
              </p>
            )}
          </motion.div>
        )}

        {/* Layout: Buttons Only */}
        {layout === 'buttons' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {renderActionButtons()}
          </motion.div>
        )}

        {/* Layout: Form Only */}
        {layout === 'form' && (
          <>
            {renderInlineForm()}
            {/* Optional secondary buttons below form */}
            {(showCallAction || showWhatsappAction) && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <div className="flex flex-wrap gap-4 justify-center">
                  {showCallAction && profile?.phone && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 rounded-full"
                    >
                      <a href={`tel:${profile.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        {labels.call}
                      </a>
                    </Button>
                  )}
                  {showWhatsappAction && profile?.whatsapp && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-6 py-3 rounded-full"
                    >
                      <a
                        href={buildWhatsappLink(profile.whatsapp, 'Hi! I\'d like to connect.')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {labels.whatsapp}
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Layout: Buttons + Form */}
        {layout === 'buttons_form' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {renderActionButtons()}
            </motion.div>
            {renderInlineForm()}
          </>
        )}

        {/* Social Links & Compliance */}
        {renderSocialLinks()}
        {renderCompliance()}
      </div>

      {/* Modals */}
      <ContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        teamId={teamId}
        source="contact_block"
      />
      
      <ScheduleTourModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        teamId={teamId}
        source="contact_block"
      />
    </section>
  )
}
