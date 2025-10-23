'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Mail, Copy, Check, Loader2, Send, Link as LinkIcon } from 'lucide-react'

interface RequestTestimonialDialogProps {
  embedded?: boolean
}

export function RequestTestimonialDialog({ embedded = false }: RequestTestimonialDialogProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [mailtoLink, setMailtoLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerateLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/testimonials/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: email }),
      })

      if (!response.ok) throw new Error('Failed to generate link')

      const data = await response.json()
      setGeneratedLink(data.submissionUrl)
      setMailtoLink(data.mailtoLink)

      toast({
        title: 'Success',
        description: 'Testimonial link generated',
      })
    } catch (error) {
      console.error('Error generating link:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate testimonial link',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Link copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy link',
      })
    }
  }

  const handleOpenEmail = () => {
    if (mailtoLink) {
      window.location.href = mailtoLink
    }
  }

  const handleReset = () => {
    setEmail('')
    setGeneratedLink(null)
    setMailtoLink(null)
    setCopied(false)
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Request a Testimonial</h3>
          <p className="text-sm text-muted-foreground">
            Send a personalized link to your client to submit their testimonial. They can add text,
            photos, ratings, and even video testimonials.
          </p>
        </div>

        {!generatedLink ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email Address *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
              />
            </div>

            <Button onClick={handleGenerateLink} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Testimonial Link
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              {/* Generated Link */}
              <div className="space-y-2">
                <Label>Testimonial Link</Label>
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="font-mono text-sm" />
                  <Button onClick={handleCopyLink} variant="outline">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This unique link is valid for this client only
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={handleOpenEmail} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Open in Email
                </Button>
                <Button onClick={handleCopyLink} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                  How to share:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Click "Open in Email" to send via your email client</li>
                  <li>• Copy the link and send via WhatsApp, SMS, or any messenger</li>
                  <li>• The client fills out a simple form with their testimonial</li>
                  <li>• You'll review and approve it before it goes live</li>
                </ul>
              </div>

              {/* Reset Button */}
              <Button onClick={handleReset} variant="outline" className="w-full">
                Generate Another Link
              </Button>
            </div>
          </>
        )}

        {/* Example Preview */}
        {!generatedLink && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-sm mb-3">What your client will see:</h4>
            <div className="bg-muted rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="w-4 h-4" />
                <span>listing.show/testimonial/abc123...</span>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Share Your Experience</p>
                <p className="text-xs text-muted-foreground">
                  A simple form asking for: Name, Location (optional), Photo (optional), 
                  Testimonial text, Rating (1-5 stars), and optional video link
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
