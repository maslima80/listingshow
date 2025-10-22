/**
 * Property listing types and utilities
 */

export const LISTING_PURPOSES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'coming_soon', label: 'Coming Soon' },
] as const;

export const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single-Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'land', label: 'Land' },
  { value: 'lot', label: 'Lot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
] as const;

export const PRICE_VISIBILITY_OPTIONS = {
  sale: [
    { value: 'show', label: 'Show price' },
    { value: 'upon_request', label: 'Price upon request' },
    { value: 'contact', label: 'Contact for price' },
  ],
  rent: [
    { value: 'show', label: 'Show rent' },
    { value: 'contact', label: 'Contact for rent' },
  ],
} as const;

export const RENT_PERIODS = [
  { value: 'month', label: 'month' },
  { value: 'week', label: 'week' },
  { value: 'night', label: 'night' },
] as const;

export type ListingPurpose = typeof LISTING_PURPOSES[number]['value'];
export type PropertyType = typeof PROPERTY_TYPES[number]['value'];
export type PriceVisibility = 'show' | 'upon_request' | 'contact';
export type RentPeriod = typeof RENT_PERIODS[number]['value'];

/**
 * Format price display based on visibility settings
 */
export function formatPriceDisplay(
  listingPurpose: ListingPurpose,
  priceVisibility: PriceVisibility,
  price?: string | number | null,
  rentPeriod?: string | null
): string {
  if (listingPurpose === 'coming_soon') {
    return 'Coming soon';
  }

  if (listingPurpose === 'sale') {
    if (priceVisibility === 'show' && price) {
      return `$${Number(price).toLocaleString()}`;
    }
    if (priceVisibility === 'upon_request') {
      return 'Price upon request';
    }
    if (priceVisibility === 'contact') {
      return 'Contact for price';
    }
  }

  if (listingPurpose === 'rent') {
    if (priceVisibility === 'show' && price) {
      const period = rentPeriod || 'month';
      return `$${Number(price).toLocaleString()} / ${period}`;
    }
    if (priceVisibility === 'contact') {
      return 'Contact for rent';
    }
  }

  return '';
}

/**
 * Get helper text for price visibility
 */
export function getPriceVisibilityHelper(
  listingPurpose: ListingPurpose,
  priceVisibility: PriceVisibility
): string {
  if (listingPurpose === 'sale') {
    if (priceVisibility === 'upon_request') {
      return 'When hidden, the public page will show "Price upon request".';
    }
    if (priceVisibility === 'contact') {
      return 'When hidden, the public page will show "Contact for price".';
    }
  }

  if (listingPurpose === 'rent' && priceVisibility === 'contact') {
    return 'When hidden, the public page will show "Contact for rent".';
  }

  return '';
}
