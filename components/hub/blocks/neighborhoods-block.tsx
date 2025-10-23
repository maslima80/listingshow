'use client'

import { NeighborhoodsBlockSettings } from '@/lib/types/hub-blocks'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Neighborhood {
  id: string
  name: string
  slug: string
  tagline: string | null
  coverImageUrl: string | null
}

interface NeighborhoodsBlockProps {
  settings: NeighborhoodsBlockSettings
  teamSlug: string
  isPreview?: boolean
}

export function NeighborhoodsBlock({
  settings,
  teamSlug,
  isPreview = false,
}: NeighborhoodsBlockProps) {
  const {
    displayType = 'cards',
    neighborhoodIds,
    showStats,
    ctaText = 'Explore Area',
    columns = 3,
  } = settings

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const response = await fetch('/api/neighborhoods')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        
        // Filter by selected IDs
        const filtered = neighborhoodIds.length > 0
          ? data.filter((n: Neighborhood) => neighborhoodIds.includes(n.id))
          : data

        setNeighborhoods(filtered)
      } catch (error) {
        console.error('Error fetching neighborhoods:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNeighborhoods()
  }, [neighborhoodIds])

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (neighborhoods.length === 0) {
    return null
  }

  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns] || 'md:grid-cols-3'

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Areas I Serve</h2>
          <p className="text-xl text-muted-foreground">
            Explore the neighborhoods where I specialize
          </p>
        </motion.div>

        {/* Neighborhoods Grid */}
        <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
          {neighborhoods.map((neighborhood, index) => (
            <motion.div
              key={neighborhood.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={isPreview ? '#' : `/neighborhoods/${neighborhood.slug}`}
                onClick={(e) => isPreview && e.preventDefault()}
                className="group block relative h-80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Background Image */}
                {neighborhood.coverImageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${neighborhood.coverImageUrl})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-white/80 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Neighborhood</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {neighborhood.name}
                  </h3>
                  
                  {neighborhood.tagline && (
                    <p className="text-white/90 text-sm mb-4 line-clamp-2">
                      {neighborhood.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">{ctaText}</span>
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
