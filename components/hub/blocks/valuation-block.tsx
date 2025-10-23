'use client'

import { ValuationBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { DollarSign, Home, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ValuationBlockProps {
  settings: ValuationBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function ValuationBlock({
  settings,
  teamId,
  isPreview = false,
}: ValuationBlockProps) {
  const {
    headline = "Curious what your home is worth?",
    description = "Get a free, no-obligation market analysis of your property.",
    formFields = ['name', 'email', 'phone', 'address'],
    ctaText = "Get My Valuation",
    successMessage = "Thanks! I'll send your valuation within 24 hours.",
    backgroundColor,
  } = settings

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [submitted, setSubmitted] = useState(false)
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
          type: 'valuation',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          message: `Home valuation request for: ${formData.address}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setSubmitted(true)
      toast({
        title: 'Request received!',
        description: successMessage,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: backgroundColor || '#f8f9fa' }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Left Side - Info */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 md:p-12 text-white flex flex-col justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <Home className="w-8 h-8" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {headline}
              </h2>

              <p className="text-lg text-white/90 mb-8">
                {description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Accurate Market Data</div>
                    <div className="text-sm text-white/80">
                      Based on recent sales and market trends
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Free & No Obligation</div>
                    <div className="text-sm text-white/80">
                      Get your estimate with no strings attached
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formFields.includes('name') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Name *
                      </label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        disabled={isPreview}
                      />
                    </div>
                  )}

                  {formFields.includes('email') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        disabled={isPreview}
                      />
                    </div>
                  )}

                  {formFields.includes('phone') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={isPreview}
                      />
                    </div>
                  )}

                  {formFields.includes('address') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Property Address *
                      </label>
                      <Input
                        placeholder="123 Main St, City, State ZIP"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        disabled={isPreview}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || isPreview}
                  >
                    {submitting ? 'Submitting...' : ctaText}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your information is secure and will never be shared.
                  </p>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                  <p className="text-muted-foreground">{successMessage}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
