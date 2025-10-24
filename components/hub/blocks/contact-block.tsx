'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ContactModal, ScheduleTourModal } from '@/components/hub/cta-modals'
import { useToast } from '@/hooks/use-toast'
import {
  Phone,
  Mail,
  Calendar,
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

const HONEYPOT_FIELD = 'website'

export function ContactBlock({
  settings,
  teamId,
  isPreview = false,
}: ContactBlockProps) {
  const {
    headline,
    subline,
    showEmail,
    showCall,
    showSchedule,
    showSocialLinks,
    showCompliance,
    anchorId = 'contact',
  } = settings

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(Boolean(teamId) && !isPreview)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return
    
    // Honeypot check
    if (formData[HONEYPOT_FIELD]) {
      toast({
        title: 'Form not sent',
        description: 'Please contact us directly.',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          source: 'contact_block',
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSuccess(true)
      setFormData({ name: '', email: '', message: '', [HONEYPOT_FIELD]: '' })
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you shortly.",
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: 'Error',
        description: 'Could not send message. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Scroll to form
  const scrollToForm = () => {
    const formElement = document.getElementById('contact-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus first input after scroll
      setTimeout(() => {
        const nameInput = document.getElementById('name')
        nameInput?.focus()
      }, 500)
    }
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

  const canShowEmail = showEmail && (profile?.email || isPreview)
  const canShowCall = showCall && (profile?.phone || isPreview)
  const canShowSchedule = showSchedule && (profile?.useInternalScheduling !== false || isPreview)

  return (
    <section id={anchorId} className="relative py-24 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Quick Action Buttons */}
        {(canShowEmail || canShowCall || canShowSchedule) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto"
          >
            {canShowSchedule && (
              <Button
                onClick={() => !isPreview && setScheduleOpen(true)}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl"
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule
              </Button>
            )}
            
            {canShowEmail && (
              <Button
                onClick={() => !isPreview && scrollToForm()}
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl"
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email
              </Button>
            )}
            
            {canShowCall && profile?.phone && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-semibold rounded-xl border-2"
              >
                <a href={`tel:${profile.phone}`}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call
                </a>
              </Button>
            )}
          </motion.div>
        )}

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
          id="contact-form"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-10 border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={submitting || isPreview}
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={submitting || isPreview}
                  className="h-12"
                />
              </div>

              {/* Honeypot field */}
              <div className="hidden">
                <Label htmlFor={HONEYPOT_FIELD}>Leave blank</Label>
                <Input
                  id={HONEYPOT_FIELD}
                  value={formData[HONEYPOT_FIELD]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [HONEYPOT_FIELD]: e.target.value }))}
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
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  required
                  disabled={submitting || isPreview}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-xl"
                disabled={submitting || isPreview || success}
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : success ? (
                  'Message Sent!'
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Social Links & Compliance */}
        {renderSocialLinks()}
        {renderCompliance()}
      </div>

      {/* Schedule Modal */}
      <ScheduleTourModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        teamId={teamId}
        source="contact_block"
      />
    </section>
  )
}
