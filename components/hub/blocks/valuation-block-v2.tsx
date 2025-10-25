'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ValuationBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'

interface ValuationBlockProps {
  settings: ValuationBlockSettings
  teamId?: string
  isPreview?: boolean
}

const HONEYPOT_FIELD = 'website'

export function ValuationBlockV2({
  settings,
  teamId,
  isPreview = false,
}: ValuationBlockProps) {
  const {
    headline,
    subline,
    ctaLabel,
    successTitle,
    successSub,
    collectPhone,
    collectPreferredContact,
    collectBestTime,
    consentLabel,
    showPrivacyNote,
    anchorId = 'valuation',
  } = settings

  const [step, setStep] = useState<1 | 2 | 'success'>(1)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Step 1: Property Info
  const [propertyData, setPropertyData] = useState({
    address: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    condition: '',
    notes: '',
  })

  // Step 2: Contact Info
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: '',
    bestTime: '',
    consent: false,
    [HONEYPOT_FIELD]: '',
  })

  const handleStep1Next = () => {
    if (!propertyData.address || !propertyData.propertyType) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter your address and property type.',
      })
      return
    }
    setStep(2)
    // Focus first input of step 2
    setTimeout(() => {
      document.getElementById('name')?.focus()
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return

    // Validate required fields
    if (!contactData.name || !contactData.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter your name and email.',
      })
      return
    }

    // Honeypot check
    if (contactData[HONEYPOT_FIELD]) {
      toast({
        title: 'Form not sent',
        description: 'Please contact us directly.',
      })
      return
    }

    // Consent check
    if (consentLabel && !contactData.consent) {
      toast({
        title: 'Consent required',
        description: 'Please agree to be contacted.',
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        teamId: teamId,
        type: 'valuation' as const,
        source: 'home_valuation_block',
        property: {
          address: propertyData.address,
          propertyType: propertyData.propertyType,
          bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : undefined,
          bathrooms: propertyData.bathrooms ? parseFloat(propertyData.bathrooms) : undefined,
          squareFeet: propertyData.squareFeet ? parseInt(propertyData.squareFeet.replace(/,/g, '')) : undefined,
          condition: propertyData.condition || undefined,
          notes: propertyData.notes || undefined,
        },
        contact: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || undefined,
          preferredContact: contactData.preferredContact || undefined,
          bestTime: contactData.bestTime || undefined,
        },
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setStep('success')
      toast({
        title: 'Valuation request sent!',
        description: "We'll be in touch soon.",
      })
    } catch (error) {
      console.error('Valuation form error:', error)
      toast({
        title: 'Error',
        description: 'Could not send request. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section id={anchorId} className="relative py-24 px-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h2>
          {subline && (
            <p className="text-lg md:text-xl text-muted-foreground">
              {subline}
            </p>
          )}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 md:p-10 border border-slate-200 dark:border-slate-800"
        >
          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-accent' : 'bg-accent/50'}`} />
                <div className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-accent' : 'bg-muted'}`} />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Step {step} of 2
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Property Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-semibold mb-6">Property Information</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="address">Property Address *</Label>
                    <Input
                      id="address"
                      value={propertyData.address}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main Street, City, State"
                      className="h-12"
                      disabled={isPreview}
                    />
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={propertyData.propertyType}
                      onValueChange={(value) => setPropertyData(prev => ({ ...prev, propertyType: value }))}
                      disabled={isPreview}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhome">Townhome</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Select
                        value={propertyData.bedrooms}
                        onValueChange={(value) => setPropertyData(prev => ({ ...prev, bedrooms: value }))}
                        disabled={isPreview}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Select
                        value={propertyData.bathrooms}
                        onValueChange={(value) => setPropertyData(prev => ({ ...prev, bathrooms: value }))}
                        disabled={isPreview}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="3.5">3.5</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="squareFeet">Square Footage</Label>
                    <Input
                      id="squareFeet"
                      value={propertyData.squareFeet}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,]/g, '')
                        setPropertyData(prev => ({ ...prev, squareFeet: value }))
                      }}
                      placeholder="1,850"
                      className="h-12"
                      disabled={isPreview}
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">Property Condition</Label>
                    <Select
                      value={propertyData.condition}
                      onValueChange={(value) => setPropertyData(prev => ({ ...prev, condition: value }))}
                      disabled={isPreview}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Needs Work">Needs Work</SelectItem>
                        <SelectItem value="Fixer Upper">Fixer Upper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={propertyData.notes}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any upgrades, features, or renovations?"
                      rows={3}
                      className="resize-none"
                      disabled={isPreview}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleStep1Next}
                      size="lg"
                      className="flex-1 h-14 text-base font-semibold rounded-xl"
                      style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                      disabled={isPreview}
                    >
                      Next: Your Contact Info
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-semibold mb-6">Your Contact Information</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={contactData.name}
                      onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Smith"
                      className="h-12"
                      required
                      disabled={submitting || isPreview}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      className="h-12"
                      required
                      disabled={submitting || isPreview}
                    />
                  </div>

                  {collectPhone && (
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactData.phone}
                        onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(305) 123-4567"
                        className="h-12"
                        disabled={submitting || isPreview}
                      />
                    </div>
                  )}

                  {collectPreferredContact && (
                    <div>
                      <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                      <Select
                        value={contactData.preferredContact}
                        onValueChange={(value) => setContactData(prev => ({ ...prev, preferredContact: value }))}
                        disabled={submitting || isPreview}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {collectBestTime && (
                    <div>
                      <Label htmlFor="bestTime">Best Time to Contact</Label>
                      <Select
                        value={contactData.bestTime}
                        onValueChange={(value) => setContactData(prev => ({ ...prev, bestTime: value }))}
                        disabled={submitting || isPreview}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Honeypot */}
                  <div className="hidden">
                    <Label htmlFor={HONEYPOT_FIELD}>Leave blank</Label>
                    <Input
                      id={HONEYPOT_FIELD}
                      value={contactData[HONEYPOT_FIELD]}
                      onChange={(e) => setContactData(prev => ({ ...prev, [HONEYPOT_FIELD]: e.target.value }))}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {consentLabel && (
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={contactData.consent}
                        onCheckedChange={(checked) => setContactData(prev => ({ ...prev, consent: checked as boolean }))}
                        disabled={submitting || isPreview}
                        className="mt-1"
                      />
                      <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                        {consentLabel}
                      </Label>
                    </div>
                  )}

                  {showPrivacyNote && (
                    <p className="text-xs text-muted-foreground">
                      We respect your privacy. Your information is used only to prepare your valuation.
                    </p>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      size="lg"
                      className="h-14 px-6 rounded-xl"
                      disabled={submitting || isPreview}
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 h-14 text-base font-semibold rounded-xl"
                      style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                      disabled={submitting || isPreview}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        ctaLabel
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <CheckCircle2 className="h-16 w-16 mx-auto mb-6 text-green-500" />
                <h3 className="text-3xl font-bold mb-4">{successTitle}</h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  {successSub}
                </p>
                {contactData.email && (
                  <p className="text-sm text-muted-foreground mb-8">
                    We've emailed a confirmation to {contactData.email}
                  </p>
                )}
                <Button
                  onClick={scrollToTop}
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  Back to Top
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
