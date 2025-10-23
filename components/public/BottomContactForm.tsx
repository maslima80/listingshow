"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2Icon, CheckCircle2 } from "lucide-react"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(160),
  phone: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface BottomContactFormProps {
  propertyId: string
  propertyTitle: string
  accentColor: string
}

export function BottomContactForm({
  propertyId,
  propertyTitle,
  accentColor,
}: BottomContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          type: 'message',
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          message: data.message || undefined,
          source: 'bottom_form',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit message')
      }

      // Success!
      setShowSuccess(true)
      toast({
        title: "Message sent!",
        description: "Thanks! We'll reach out shortly.",
      })

      // Reset form
      reset()

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 shadow-lg text-center">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xl font-bold mb-2">Thanks! We'll reach out shortly.</h3>
        <p className="text-sm text-muted-foreground">
          Your message has been sent successfully.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-lg">
      <h3 className="text-xl sm:text-2xl font-bold mb-2">
        Have a question about {propertyTitle}?
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Send us a message and we'll get back to you soon
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="contact-name" className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contact-name"
            placeholder="Your full name"
            {...register('name')}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="contact-email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="contact-phone" className="text-sm font-medium">
            Phone (optional)
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...register('phone')}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="contact-message" className="text-sm font-medium">
            Message (optional)
          </Label>
          <Textarea
            id="contact-message"
            placeholder="What would you like to know?"
            rows={4}
            {...register('message')}
            disabled={isSubmitting}
            className="mt-1 resize-none"
          />
          {errors.message && (
            <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-semibold"
          style={{ backgroundColor: accentColor }}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
    </div>
  )
}
