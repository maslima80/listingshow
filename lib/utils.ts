import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slug validation
const RESERVED_SLUGS = [
  'api', 'admin', 'p', 'u', 'signin', 'signup', 'pricing', 
  'dashboard', 'settings', 'onboarding', 'properties', 'hub',
  'billing', 'account', 'team', 'agents', 'theme', 'help',
  'support', 'contact', 'about', 'terms', 'privacy', 'blog'
];

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  // Check length
  if (slug.length < 3 || slug.length > 30) {
    return { valid: false, error: 'Slug must be between 3 and 30 characters' };
  }

  // Check format (lowercase alphanumeric and hyphens only)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  // Check start/end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  // Check reserved words
  if (RESERVED_SLUGS.includes(slug)) {
    return { valid: false, error: 'This slug is reserved and cannot be used' };
  }

  return { valid: true };
}

export function generateSlugSuggestions(baseSlug: string): string[] {
  const suggestions: string[] = [];
  const cleanSlug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
  
  // Add numbered variations
  for (let i = 1; i <= 3; i++) {
    suggestions.push(`${cleanSlug}-${i}`);
  }
  
  // Add year suffix
  const year = new Date().getFullYear();
  suggestions.push(`${cleanSlug}-${year}`);
  
  // Add random suffix
  const random = Math.floor(Math.random() * 999) + 100;
  suggestions.push(`${cleanSlug}-${random}`);
  
  return suggestions.filter(s => validateSlug(s).valid);
}

// Format currency
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Format area
export function formatArea(sqm: number | string | null, unit: 'sqm' | 'sqft' = 'sqm'): string {
  if (!sqm) return '';
  
  const num = typeof sqm === 'string' ? parseFloat(sqm) : sqm;
  
  if (unit === 'sqft') {
    const sqft = num * 10.764;
    return `${Math.round(sqft).toLocaleString()} sq ft`;
  }
  
  return `${Math.round(num).toLocaleString()} m²`;
}

// Calculate trial days remaining
export function getTrialDaysRemaining(trialEndsAt: Date | string | null): number {
  if (!trialEndsAt) return 0;
  
  const endDate = typeof trialEndsAt === 'string' ? new Date(trialEndsAt) : trialEndsAt;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Plan limits
export const PLAN_LIMITS = {
  solo: {
    properties: 2,
    videoMinutes: 30,
    price: 39,
  },
  pro: {
    properties: 5,
    videoMinutes: 60,
    price: 79,
  },
  agency: {
    properties: 15,
    videoMinutes: 150,
    price: 159,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}
