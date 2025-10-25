'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LeadMagnetBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Download, FileText, CheckCircle2, Loader2, X } from 'lucide-react'

interface LeadMagnetBlockProps {
  settings: LeadMagnetBlockSettings
  teamId?: string
  isPreview?: boolean
}

export function LeadMagnetBlockV2({
  settings,
  teamId,
  isPreview = false,
}: LeadMagnetBlockProps) {
  const {
    title,
    description,
    asset,
    thumbnailUrl,
    ctaLabel,
    gate,
    layout = 'card',
  } = settings

  const [showGateModal, setShowGateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false,
  })
  const { toast } = useToast()

  // Validate block has required content
  const hasValidAsset = (asset.type === 'file' && asset.fileUrl) || (asset.type === 'url' && asset.targetUrl)
  if (!title || !hasValidAsset) {
    if (isPreview) {
      return (
        <div className="py-12 px-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
          <p className="text-center text-amber-900 dark:text-amber-100">
            <strong>Lead Magnet Block:</strong> Please configure title and asset (file or URL) in settings.
          </p>
        </div>
      )
    }
    return null
  }

  const resolvedUrl = asset.type === 'file' ? asset.fileUrl : asset.targetUrl
  const displayThumbnail = thumbnailUrl 
    ? `${thumbnailUrl}?tr=w-1200,h-800,fo-auto` 
    : null

  const handleDownload = () => {
    if (gate.enabled && !isPreview) {
      setShowGateModal(true)
    } else {
      triggerDownload()
    }
  }

  const triggerDownload = () => {
    if (resolvedUrl) {
      // Use proxy endpoint to force download (handles CORS issues with external files)
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      const downloadUrl = `/api/download?url=${encodeURIComponent(resolvedUrl)}&filename=${encodeURIComponent(filename)}`
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // TODO: Fire analytics: 'lead_magnet_download'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPreview) return

    // Validate consent if required
    if (gate.consentLabel && !formData.consent) {
      toast({
        title: 'Consent required',
        description: 'Please agree to the terms to continue.',
      })
      return
    }

    setSubmitting(true)

    try {
      // Create lead
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          type: 'message',
          name: formData.name,
          email: formData.email,
          phone: gate.requirePhone ? formData.phone : undefined,
          message: `Lead Magnet Download: ${title}`,
          source: 'hub_lead_magnet',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      // TODO: Fire analytics: 'lead_magnet_submit'

      toast({
        title: 'Success!',
        description: 'Your download will start now.',
      })

      // Close modal and trigger download
      setShowGateModal(false)
      triggerDownload()

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        consent: false,
      })
    } catch (error) {
      console.error('Lead magnet error:', error)
      toast({
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="py-16 px-6">
        <div className={layout === 'banner' ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-3xl transition-shadow duration-300"
          >
            {layout === 'card' ? (
              /* Card Layout */
              <div className="grid md:grid-cols-5">
                {/* Thumbnail */}
                <div className="md:col-span-2 relative bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center p-8">
                  {displayThumbnail ? (
                    <img
                      src={displayThumbnail}
                      alt={title}
                      className="w-full h-64 md:h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                        <FileText className="h-12 w-12" style={{ color: 'var(--accent-color, #C9A66B)' }} />
                      </div>
                      <p className="text-sm text-muted-foreground">Document Preview</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-3 p-8 md:p-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium mb-4">
                    <Download className="h-4 w-4" />
                    Free Download
                  </div>

                  <h2 className="text-3xl font-bold mb-3">{title}</h2>

                  {description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {description}
                    </p>
                  )}

                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full h-14 text-base font-semibold rounded-xl"
                    style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                    disabled={isPreview}
                    aria-label={`Download ${title}`}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {ctaLabel}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {gate.enabled 
                      ? '100% free • Quick form • Instant access'
                      : '100% free • No signup required • Instant download'}
                  </p>
                </div>
              </div>
            ) : (
              /* Banner Layout */
              <div className="relative min-h-[300px]">
                {/* Background with thumbnail */}
                {displayThumbnail && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={displayThumbnail}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 dark:from-black/80 dark:to-black/60" />
                  </div>
                )}
                
                <div className={`relative ${displayThumbnail ? '' : 'bg-gradient-to-r from-accent/20 to-accent/10'} p-8 md:p-12`}>
                  <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
                    {/* Icon/Thumbnail */}
                    <div className="flex-shrink-0">
                      {!displayThumbnail && (
                        <div className="h-32 w-32 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <FileText className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium mb-3">
                        <Download className="h-4 w-4" />
                        Free Download
                      </div>

                      <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${displayThumbnail ? 'text-white' : ''}`}>
                        {title}
                      </h2>

                      {description && (
                        <p className={`text-lg mb-6 leading-relaxed ${displayThumbnail ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {description}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={handleDownload}
                        size="lg"
                        className="h-16 px-8 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-shadow"
                        style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                        disabled={isPreview}
                        aria-label={`Download ${title}`}
                      >
                        <Download className="h-6 w-6 mr-2" />
                        {ctaLabel}
                      </Button>
                      <p className={`text-xs text-center mt-3 ${displayThumbnail ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {gate.enabled 
                          ? '100% free • Quick form'
                          : '100% free • Instant download'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Lead Gate Modal */}
      <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get Your Free Download</DialogTitle>
            <DialogDescription>
              Fill in your details below to access {title}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="lead-name">Full Name *</Label>
              <Input
                id="lead-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                required
                disabled={submitting}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="lead-email">Email *</Label>
              <Input
                id="lead-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
                disabled={submitting}
                className="h-12"
              />
            </div>

            {gate.requirePhone && (
              <div>
                <Label htmlFor="lead-phone">Phone *</Label>
                <Input
                  id="lead-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(305) 123-4567"
                  required
                  disabled={submitting}
                  className="h-12"
                />
              </div>
            )}

            {gate.consentLabel && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="lead-consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  disabled={submitting}
                  className="mt-1"
                />
                <Label htmlFor="lead-consent" className="text-sm leading-relaxed cursor-pointer">
                  {gate.consentLabel}
                </Label>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGateModal(false)}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
                style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
