"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { CalendarIcon, ClockIcon, Loader2Icon } from "lucide-react"

const scheduleTourSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(160),
  phone: z.string().max(40).optional(),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().max(2000).optional(),
})

type ScheduleTourFormData = z.infer<typeof scheduleTourSchema>

interface ScheduleTourModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string
  propertyTitle: string
  source?: string
  type?: 'tour_request' | 'message'
}

export function ScheduleTourModal({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  source = 'schedule_tour_modal',
  type = 'tour_request',
}: ScheduleTourModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScheduleTourFormData>({
    resolver: zodResolver(scheduleTourSchema),
  })

  const timeWindow = watch('preferredTimeWindow')

  const onSubmit = async (data: ScheduleTourFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          type,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          preferredDate: data.preferredDate || undefined,
          preferredTimeWindow: data.preferredTimeWindow || undefined,
          message: data.message || undefined,
          source,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }

      // Success!
      toast({
        title: type === 'tour_request' ? "Tour request sent!" : "Message sent!",
        description: type === 'tour_request' 
          ? "The agent will contact you soon to confirm your tour."
          : "The agent will get back to you shortly.",
      })

      // Reset form and close modal
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Lead submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTourRequest = type === 'tour_request'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isTourRequest ? "Schedule a Tour" : "Contact Agent"}
          </DialogTitle>
          <DialogDescription>
            {isTourRequest 
              ? `Request a tour of ${propertyTitle}. The agent will confirm your preferred time.`
              : `Send a message about ${propertyTitle}.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              {...register('phone')}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Tour-specific fields */}
          {isTourRequest && (
            <>
              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Preferred Day (optional)
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...register('preferredDate')}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Window */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Preferred Time (optional)
                </Label>
                <RadioGroup
                  value={timeWindow}
                  onValueChange={(value) => setValue('preferredTimeWindow', value as any)}
                  disabled={isSubmitting}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning" className="font-normal cursor-pointer">
                      Morning (8am - 12pm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon" className="font-normal cursor-pointer">
                      Afternoon (12pm - 5pm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening" className="font-normal cursor-pointer">
                      Evening (5pm - 8pm)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {isTourRequest ? "Message (optional)" : "Message"}
            </Label>
            <Textarea
              id="message"
              placeholder={isTourRequest 
                ? "Any specific questions or requirements?"
                : "What would you like to know?"
              }
              rows={3}
              {...register('message')}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                isTourRequest ? "Request Tour" : "Send Message"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
