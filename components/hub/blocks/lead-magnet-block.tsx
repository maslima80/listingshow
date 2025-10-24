'use client'

import { LeadMagnetBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Download, FileText, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Resource {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  fileUrl: string
}

interface LeadMagnetBlockProps {
  settings: LeadMagnetBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function LeadMagnetBlock({
  settings,
  teamId,
  isPreview = false,
}: LeadMagnetBlockProps) {
  const {
    resourceId,
    headline,
    description,
    coverImageUrl,
    formFields = ['name', 'email'],
    ctaText = "Download Now",
    backgroundColor,
  } = settings

  const [resource, setResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/resources/${resourceId}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setResource(data)
      } catch (error) {
        console.error('Error fetching resource:', error)
        setResource(null)
      }
    }

    if (resourceId) {
      fetchResource()
    }
  }, [resourceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return

    setSubmitting(true)

    try {
      // Record the download
      const response = await fetch(`/api/resources/${resourceId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      const data = await response.json()

      setSubmitted(true)
      toast({
        title: 'Success!',
        description: 'Your download will start shortly.',
      })

      // Trigger download
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process download. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!resource && !isPreview) {
    return null
  }

  const displayTitle = headline || resource?.title || 'Download Free Resource'
  const displayDescription = description || resource?.description || 'Get instant access to this valuable resource.'
  const displayCover = coverImageUrl || resource?.coverImageUrl

  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Left Side - Resource Preview */}
            <div className="relative p-8 md:p-12 flex items-center justify-center bg-white/10">
              {displayCover ? (
                <div className="relative">
                  <img
                    src={displayCover}
                    alt={displayTitle}
                    className="w-64 h-80 object-cover rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              ) : (
                <div className="w-64 h-80 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-24 h-24 text-white/60" />
                </div>
              )}
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12 bg-white">
              {!submitted ? (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                      <Download className="w-4 h-4" />
                      Free Download
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-3">
                      {displayTitle}
                    </h2>
                    
                    <p className="text-muted-foreground">
                      {displayDescription}
                    </p>
                  </div>

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

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting || isPreview}
                    >
                      {submitting ? (
                        'Processing...'
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          {ctaText}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      100% free. No credit card required.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Download Started!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your download should begin automatically.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for additional resources.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
