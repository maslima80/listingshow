/**
 * Property formatting utilities
 * Used across property cards, hero sections, and hub blocks
 */

export interface PropertyFormatting {
  listingPurpose: 'sale' | 'rent' | 'coming_soon'
  priceVisibility?: 'show' | 'upon_request' | 'contact'
  price?: number | string // Can be numeric or string from DB
  rentPeriod?: string // 'month', 'week', 'night'
  currency?: string
  beds?: number
  baths?: number | string // Can be decimal from DB
}

/**
 * Format beds count with proper singular/plural
 * Examples: 1 -> "1 Bed", 2 -> "2 Beds"
 */
export function formatBeds(n?: number): string | null {
  if (n == null) return null
  return n === 1 ? '1 Bed' : `${n} Beds`
}

/**
 * Format baths count with half-bath support using ½ glyph
 * Examples:
 * - 0.5 -> "½ Bath"
 * - 1 -> "1 Bath"
 * - 1.5 -> "1½ Baths"
 * - 2 -> "2 Baths"
 * - 2.5 -> "2½ Baths"
 * - 3.5 -> "3½ Baths"
 */
export function formatBaths(n?: number | string): string | null {
  if (n == null) return null
  
  // Convert string to number if needed
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return null
  
  const whole = Math.floor(num)
  const frac = Math.round((num - whole) * 10) / 10
  const half = Math.abs(frac - 0.5) < 1e-6
  
  if (half && whole === 0) return '½ Bath'
  if (half) return `${whole}½ Baths`
  return num === 1 ? '1 Bath' : `${num} Baths`
}

/**
 * Format price label based on listing purpose and price visibility settings
 * Respects all property builder options:
 * - For Sale: show, upon_request, contact
 * - For Rent: show, upon_request, contact
 * - Coming Soon: always shows "Coming soon"
 */
export function formatPriceLabel(
  property: PropertyFormatting,
  opts?: { currency?: string; locale?: string }
): string {
  const currency = opts?.currency ?? property.currency ?? 'USD'
  const locale = opts?.locale ?? 'en-US'

  // Coming Soon - no pricing
  if (property.listingPurpose === 'coming_soon') {
    return 'Coming soon'
  }

  // Convert price to number if it's a string
  const priceNum = typeof property.price === 'string' ? parseFloat(property.price) : property.price

  // For Sale
  if (property.listingPurpose === 'sale') {
    if (property.priceVisibility === 'show' && priceNum != null && !isNaN(priceNum)) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(priceNum)
    }
    if (property.priceVisibility === 'upon_request') {
      return 'Price upon request'
    }
    return 'Contact for price'
  }

  // For Rent (uses same price field)
  if (property.listingPurpose === 'rent') {
    if (property.priceVisibility === 'show' && priceNum != null && !isNaN(priceNum)) {
      const label = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(priceNum)
      // Map rentPeriod to short form
      let per = 'mo'
      if (property.rentPeriod === 'week') per = 'wk'
      else if (property.rentPeriod === 'night' || property.rentPeriod === 'day') per = 'day'
      return `${label}/${per}`
    }
    if (property.priceVisibility === 'upon_request') {
      return 'Contact for rent'
    }
    return 'Contact for rent'
  }

  return ''
}

/**
 * Get status badge label based on listing purpose
 */
export function getStatusBadge(listingPurpose: 'sale' | 'rent' | 'coming_soon'): string {
  switch (listingPurpose) {
    case 'sale':
      return 'For Sale'
    case 'rent':
      return 'For Rent'
    case 'coming_soon':
      return 'Coming Soon'
    default:
      return 'For Sale'
  }
}

/**
 * Format property stats line with middle dot separators
 * Only shows values that exist
 * Example: "3 Beds · 2½ Baths · 1,980 Sq Ft"
 */
export function formatPropertyStats(property: {
  beds?: number
  baths?: number
  sqft?: number
}): string {
  const parts: string[] = []
  
  const bedsText = formatBeds(property.beds)
  if (bedsText) parts.push(bedsText)
  
  const bathsText = formatBaths(property.baths)
  if (bathsText) parts.push(bathsText)
  
  if (property.sqft) {
    parts.push(`${property.sqft.toLocaleString()} Sq Ft`)
  }
  
  return parts.join(' · ')
}
