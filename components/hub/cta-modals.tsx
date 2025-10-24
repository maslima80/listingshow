'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/hooks/use-toast'
import { Loader2Icon, CheckCircle2 } from 'lucide-react'

// ============================================================================
// CONTACT MODAL
// ============================================================================

const contactSchema = z.object({
  name: z.string().min(2, 'Name required').max(120),
  email: z.string().email('Invalid email').max(160),
  phone: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId?: string
  source?: string
}

export function ContactModal({ open, onOpenChange, teamId, source = 'hero_cta' }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          source,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setIsSuccess(true)
      form.reset()

      setTimeout(() => {
        setIsSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get in Touch</DialogTitle>
          <DialogDescription>
            Send me a message and I'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Message Sent!</p>
            <p className="text-sm text-muted-foreground mt-2">
              I'll reach out to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Your name"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...form.register('message')}
                placeholder="How can I help you?"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// SCHEDULE TOUR MODAL
// ============================================================================

const scheduleTourSchema = z.object({
  name: z.string().min(2, 'Name required').max(120),
  email: z.string().email('Invalid email').max(160),
  phone: z.string().max(40).optional(),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().max(2000).optional(),
})

type ScheduleTourFormData = z.infer<typeof scheduleTourSchema>

interface ScheduleTourModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId?: string
  source?: string
}

export function ScheduleTourModal({
  open,
  onOpenChange,
  teamId,
  source = 'hero_cta',
}: ScheduleTourModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ScheduleTourFormData>({
    resolver: zodResolver(scheduleTourSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTimeWindow: 'morning',
      message: '',
    },
  })

  const onSubmit = async (data: ScheduleTourFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tour_request',
          source,
          name: data.name,
          email: data.email,
          phone: data.phone,
          preferredDate: data.preferredDate,
          preferredTimeWindow: data.preferredTimeWindow,
          message: data.message,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setIsSuccess(true)
      form.reset()

      setTimeout(() => {
        setIsSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error('Schedule tour error:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule tour. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Tour</DialogTitle>
          <DialogDescription>
            Let me know when you'd like to visit and I'll confirm the details.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Tour Request Received!</p>
            <p className="text-sm text-muted-foreground mt-2">
              I'll reach out to confirm the details.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Your name"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                {...form.register('preferredDate')}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>Preferred Time</Label>
              <RadioGroup
                defaultValue="morning"
                onValueChange={(value) =>
                  form.setValue('preferredTimeWindow', value as any)
                }
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning" className="font-normal">
                    Morning (9am - 12pm)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon" className="font-normal">
                    Afternoon (12pm - 5pm)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening" className="font-normal">
                    Evening (5pm - 8pm)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message">Additional Notes</Label>
              <Textarea
                id="message"
                {...form.register('message')}
                placeholder="Any specific requests or questions?"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Request Tour
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// HOME VALUATION MODAL
// ============================================================================

const valuationSchema = z.object({
  name: z.string().min(2, 'Name required').max(120),
  email: z.string().email('Invalid email').max(160),
  phone: z.string().max(40).optional(),
  address: z.string().min(5, 'Address required').max(200),
  message: z.string().max(2000).optional(),
})

type ValuationFormData = z.infer<typeof valuationSchema>

interface ValuationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId?: string
  source?: string
}

export function ValuationModal({
  open,
  onOpenChange,
  teamId,
  source = 'hero_cta',
}: ValuationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      message: '',
    },
  })

  const onSubmit = async (data: ValuationFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'home_valuation',
          source,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: `Property Address: ${data.address}\n\n${data.message || ''}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setIsSuccess(true)
      form.reset()

      setTimeout(() => {
        setIsSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error('Valuation form error:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Your Home Valuation</DialogTitle>
          <DialogDescription>
            I'll provide a free, no-obligation market analysis of your property.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Request Received!</p>
            <p className="text-sm text-muted-foreground mt-2">
              I'll send your valuation within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Your name"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="123 Main St, City, State ZIP"
                disabled={isSubmitting}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Additional Information</Label>
              <Textarea
                id="message"
                {...form.register('message')}
                placeholder="Any details about your property..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Get My Valuation
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
