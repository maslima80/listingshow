'use client'

import { ContactBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Phone, Mail, Calendar, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ContactBlockProps {
  settings: ContactBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function ContactBlock({
  settings,
  teamId,
  isPreview = false,
}: ContactBlockProps) {
  const {
    headline = "Let's Talk Real Estate",
    showPhone,
    phone,
    showEmail,
    email,
    showSchedule,
    scheduleLink,
    showWhatsapp,
    whatsapp,
    showContactForm,
    backgroundColor,
  } = settings

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      toast({
        title: 'Message sent!',
        description: "I'll get back to you as soon as possible.",
      })

      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">{headline}</h2>
          <p className="text-xl text-muted-foreground">
            Choose your preferred way to connect
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {showPhone && phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Call Me</div>
                  <div className="text-sm text-muted-foreground">{phone}</div>
                </div>
              </a>
            )}

            {showEmail && email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Email Me</div>
                  <div className="text-sm text-muted-foreground">{email}</div>
                </div>
              </a>
            )}

            {showSchedule && scheduleLink && (
              <a
                href={scheduleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Schedule a Meeting</div>
                  <div className="text-sm text-muted-foreground">
                    Book a time that works for you
                  </div>
                </div>
              </a>
            )}

            {showWhatsapp && whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-sm text-muted-foreground">{whatsapp}</div>
                </div>
              </a>
            )}
          </motion.div>

          {/* Contact Form */}
          {showContactForm && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isPreview}
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isPreview}
                  />
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={isPreview}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={5}
                    required
                    disabled={isPreview}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || isPreview}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
