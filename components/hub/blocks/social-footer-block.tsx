'use client'

import { SocialFooterBlockSettings } from '@/lib/types/hub-blocks'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Linkedin, Youtube, Twitter } from 'lucide-react'

interface SocialFooterBlockProps {
  settings: SocialFooterBlockSettings
  teamName?: string
  isPreview?: boolean
}

export function SocialFooterBlock({
  settings,
  teamName = 'Listing.Show',
  isPreview = false,
}: SocialFooterBlockProps) {
  const {
    socialLinks,
    showBrokerageDisclosure = true,
    disclosureText,
    showPoweredBy = true,
    backgroundColor,
  } = settings

  const socialIcons: Record<string, { icon: any; label: string; color: string }> = {
    instagram: { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
    facebook: { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-600' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-700' },
    youtube: { icon: Youtube, label: 'YouTube', color: 'hover:text-red-600' },
    twitter: { icon: Twitter, label: 'Twitter', color: 'hover:text-blue-400' },
  }

  const activeSocials = Object.entries(socialLinks).filter(([_, url]) => url)

  return (
    <footer
      className="py-12 px-6 border-t"
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Social Links */}
          {activeSocials.length > 0 && (
            <div className="flex justify-center gap-6">
              {activeSocials.map(([platform, url]) => {
                const social = socialIcons[platform]
                if (!social) return null

                const Icon = social.icon

                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => isPreview && e.preventDefault()}
                    className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all ${social.color} hover:scale-110`}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          )}

          {/* Brokerage Disclosure */}
          {showBrokerageDisclosure && disclosureText && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {disclosureText}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {teamName}. All rights reserved.
            </div>

            {showPoweredBy && (
              <a
                href="https://listing.show"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => isPreview && e.preventDefault()}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span>Powered by</span>
                <span className="font-semibold">Listing.Show</span>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
