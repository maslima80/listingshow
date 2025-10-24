'use client'

import { useState, useEffect } from 'react'
import { PropertiesBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Bed, Bath, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PropertiesBlockV2Props {
  settings: PropertiesBlockSettings
  teamSlug?: string
  isPreview?: boolean
}

interface Property {
  id: string
  slug: string
  title: string
  location: string
  coverImageUrl?: string
  price?: number
  currency?: string
  priceVisibility?: string
  beds?: number
  baths?: number
  status: string
  listingPurpose: string
}

const STATUS_LABELS = {
  published: 'For Sale',
  rented: 'For Rent',
  sold: 'Sold',
  draft: 'Coming Soon',
}

export function PropertiesBlockV2({ settings, teamSlug, isPreview = false }: PropertiesBlockV2Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const { propertyIds, layout, max, show, ctaLabel, title, subtitle, hideHeading } = settings

  // Fetch selected properties
  useEffect(() => {
    if (propertyIds.length > 0 && !isPreview) {
      setLoading(true)
      // Fetch properties by IDs
      fetch(`/api/properties?ids=${propertyIds.join(',')}&limit=${max}`)
        .then(res => res.json())
        .then(data => {
          setProperties(data.properties || [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch properties:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [propertyIds, max, isPreview])

  // Validation
  const hasRequiredContent = propertyIds.length >= 1

  // Show placeholder in editor if no properties selected
  if (!hasRequiredContent && isPreview) {
    return (
      <section className="w-full py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-2xl font-semibold mb-3">Featured Properties</h3>
          <p className="text-muted-foreground mb-6">
            Select properties to showcase in this section.
          </p>
          <p className="text-sm text-muted-foreground">
            We'll use each property's cover image automatically.
          </p>
        </div>
      </section>
    )
  }

  // Hide on public if no properties
  if (!hasRequiredContent && !isPreview) {
    return null
  }

  if (loading) {
    return (
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Loading properties...</div>
        </div>
      </section>
    )
  }

  // Determine actual layout based on property count
  const actualLayout = layout === 'auto' 
    ? properties.length === 1 ? 'hero' 
    : properties.length <= 6 ? 'grid' 
    : 'carousel'
    : layout

  // Format price
  const formatPrice = (property: Property) => {
    if (property.priceVisibility === 'hide' || !property.price) {
      return 'Price on Request'
    }
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: property.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(property.price)
    return formatted
  }

  // Get ImageKit URL
  const getImageUrl = (url?: string, width = 1200, height = 1200) => {
    if (!url) return '/placeholder.svg'
    if (url.includes('imagekit.io')) {
      return `${url}?tr=w-${width},h-${height},fo-auto`
    }
    return url
  }

  // Render property card
  const renderPropertyCard = (property: Property, index: number) => (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/${teamSlug}/${property.slug}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.03]">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${getImageUrl(property.coverImageUrl)})`,
            }}
          />

          {/* Gradient Overlay (bottom 40%) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badge (top-left) */}
          {show.badges && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-black hover:bg-white">
                {STATUS_LABELS[property.status as keyof typeof STATUS_LABELS] || property.listingPurpose}
              </Badge>
            </div>
          )}

          {/* Content (bottom) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
              {property.title}
            </h3>

            {/* Location */}
            {show.location && (
              <div className="flex items-center gap-2 mb-3 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.location}</span>
              </div>
            )}

            {/* Beds/Baths */}
            {show.bedsBaths && (property.beds || property.baths) && (
              <div className="flex items-center gap-4 mb-3 text-sm text-white/90">
                {property.beds && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.beds} Beds</span>
                  </div>
                )}
                {property.baths && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.baths} Baths</span>
                  </div>
                )}
              </div>
            )}

            {/* Price & CTA */}
            <div className="flex items-center justify-between">
              {show.price && (
                <div className="text-2xl font-bold">
                  {formatPrice(property)}
                </div>
              )}
              {show.cta && (
                <Button
                  size="sm"
                  className="text-xs px-4 py-2 uppercase tracking-wider font-medium"
                  style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                >
                  {ctaLabel}
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )

  // Render hero layout (single property)
  const renderHero = () => {
    const property = properties[0]
    if (!property) return null

    return (
      <Link href={`/${teamSlug}/${property.slug}`} className="block">
        <div className="relative w-full aspect-video md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group">
          {/* Background Image with Ken Burns */}
          <div 
            className="absolute inset-0 bg-cover bg-center animate-ken-burns"
            style={{ 
              backgroundImage: `url(${getImageUrl(property.coverImageUrl, 1920, 1080)})`,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Badge */}
          {show.badges && (
            <div className="absolute top-6 left-6">
              <Badge className="bg-white/90 text-black hover:bg-white text-sm px-4 py-2">
                {STATUS_LABELS[property.status as keyof typeof STATUS_LABELS] || property.listingPurpose}
              </Badge>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {property.title}
              </h2>

              {show.location && (
                <div className="flex items-center gap-2 mb-4 text-lg text-white/90">
                  <MapPin className="w-5 h-5" />
                  <span>{property.location}</span>
                </div>
              )}

              {show.bedsBaths && (property.beds || property.baths) && (
                <div className="flex items-center gap-6 mb-6 text-white/90">
                  {property.beds && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5" />
                      <span className="text-lg">{property.beds} Bedrooms</span>
                    </div>
                  )}
                  {property.baths && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5" />
                      <span className="text-lg">{property.baths} Bathrooms</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-6">
                {show.price && (
                  <div className="text-4xl md:text-5xl font-bold">
                    {formatPrice(property)}
                  </div>
                )}
                {show.cta && (
                  <Button
                    size="lg"
                    className="text-sm px-10 py-6 uppercase tracking-wider font-medium"
                    style={{ backgroundColor: 'var(--accent-color, #C9A66B)' }}
                  >
                    {ctaLabel}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <section id="properties" className="w-full py-16 md:py-24 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        {!hideHeading && (title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Hero Layout (1 property) */}
        {actualLayout === 'hero' && renderHero()}

        {/* Grid Layout (2-6 properties) */}
        {actualLayout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, max).map((property, index) => 
              renderPropertyCard(property, index)
            )}
          </div>
        )}

        {/* Carousel Layout (>6 properties) */}
        {actualLayout === 'carousel' && (
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-6" style={{ width: 'max-content' }}>
              {properties.slice(0, max).map((property, index) => (
                <div key={property.id} className="w-80 flex-shrink-0">
                  {renderPropertyCard(property, index)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
