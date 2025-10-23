'use client'

import { PropertiesBlockSettings } from '@/lib/types/hub-blocks'
import { motion } from 'framer-motion'
import { Bed, Bath, Square, MapPin, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Property {
  id: string
  slug: string
  name: string
  price: number | null
  priceVisibility: string
  location: string | null
  beds: number | null
  baths: number | null
  sqft: number | null
  heroMediaUrl: string | null
  heroMediaType: string | null
  status: string
  listingPurpose: string | null
}

interface PropertiesBlockProps {
  settings: PropertiesBlockSettings
  teamSlug: string
  isPreview?: boolean
}

export function PropertiesBlock({
  settings,
  teamSlug,
  isPreview = false,
}: PropertiesBlockProps) {
  const {
    displayType = 'grid',
    propertyFilter = 'all',
    limit = 6,
    showStatusBadge = true,
    autoRotate = false,
    columns = 3,
  } = settings

  const [properties, setProperties] = useState<Property[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        
        // Filter by status
        let filtered = data.filter((p: Property) => p.status === 'published')
        
        // Filter by listing purpose
        if (propertyFilter !== 'all') {
          const purposeMap: Record<string, string> = {
            for_sale: 'sale',
            for_rent: 'rent',
            sold: 'sold',
          }
          filtered = filtered.filter(
            (p: Property) => p.listingPurpose === purposeMap[propertyFilter]
          )
        }

        // Apply limit
        filtered = filtered.slice(0, limit)
        
        setProperties(filtered)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [propertyFilter, limit])

  // Auto-rotate for carousel
  useEffect(() => {
    if (!autoRotate || properties.length <= 1 || displayType !== 'carousel') return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRotate, properties.length, displayType])

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return null
  }

  const formatPrice = (price: number | null, visibility: string) => {
    if (!price || visibility !== 'show') {
      return visibility === 'upon_request' ? 'Price Upon Request' : 'Contact for Price'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (purpose: string | null) => {
    const badges: Record<string, { label: string; color: string }> = {
      sale: { label: 'For Sale', color: 'bg-green-600' },
      rent: { label: 'For Rent', color: 'bg-blue-600' },
      sold: { label: 'Sold', color: 'bg-gray-600' },
    }
    return badges[purpose || 'sale'] || badges.sale
  }

  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-3'

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <p className="text-xl text-muted-foreground">
            Discover exceptional homes and investment opportunities
          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={isPreview ? '#' : `/p/${property.slug}`}
                onClick={(e) => isPreview && e.preventDefault()}
                className="group block bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-muted">
                  {property.heroMediaUrl ? (
                    property.heroMediaType === 'video' ? (
                      <video
                        src={property.heroMediaUrl}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${property.heroMediaUrl})` }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600" />
                  )}

                  {/* Status Badge */}
                  {showStatusBadge && property.listingPurpose && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusBadge(property.listingPurpose).color}`}>
                      {getStatusBadge(property.listingPurpose).label}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Price */}
                  <div className="text-2xl font-bold text-primary mb-2">
                    {formatPrice(property.price, property.priceVisibility)}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {property.name}
                  </h3>

                  {/* Location */}
                  {property.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                    {property.beds !== null && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.beds} Beds</span>
                      </div>
                    )}
                    {property.baths !== null && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.baths} Baths</span>
                      </div>
                    )}
                    {property.sqft !== null && (
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* View Details */}
                  <div className="flex items-center gap-2 text-primary mt-4 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
