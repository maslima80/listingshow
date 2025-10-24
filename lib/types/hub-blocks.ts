/**
 * TypeScript types for Hub Block settings
 * Each block type has its own settings structure stored in settingsJson
 */

// Base block type
export type HubBlockType =
  | 'hero'
  | 'about'
  | 'properties'
  | 'neighborhoods'
  | 'testimonials'
  | 'blog'
  | 'valuation'
  | 'mortgage'
  | 'lead_magnet'
  | 'contact'
  | 'social_footer'
  | 'property'
  | 'link'
  | 'image'
  | 'video'
  | 'text'
  | 'spacer';

// Hero Block Settings (MVP: Image only, CRM-aware CTAs)
export type CtaActionType = 'anchor' | 'contact' | 'schedule' | 'valuation' | 'mortgage' | 'url';

export interface CtaAction {
  type: CtaActionType;
  value?: string; // hash id for anchor, URL for url type
}

export interface CtaConfig {
  label: string;
  action: CtaAction;
}

export interface HeroBlockSettings {
  headline: string; // required
  tagline?: string;
  backgroundImage: {
    url: string; // ImageKit URL
    alt: string;
  };
  overlay: 'light' | 'balanced' | 'dark';
  textAlign: 'left' | 'center' | 'right'; // mobile always center
  primaryCta: CtaConfig; // required
  secondaryCta: {
    enabled: boolean;
    label?: string;
    action?: CtaAction;
  };
  showAgencyLogo: boolean;
}

// About Block Settings
export interface AboutBlockSettings {
  useProfile: boolean; // If true, pull from Profile Manager
  override?: {
    photoUrl?: string;
    fullName?: string;
    title?: string;
    shortBio?: string;
    extendedBio?: string;
    videoAssetId?: string; // Bunny (phase 2)
    stats?: {
      years?: number;
      homesSold?: number;
      volume?: string; // e.g., "$100M+"
    };
    credentials?: string[];
  };
  show: {
    photo: boolean;
    shortBio: boolean;
    extendedBio: boolean;
    videoIntro: boolean; // phase 2
    stats: boolean;
    credentials: boolean;
    socialLinks: boolean;
  };
  layout: 'photoLeft' | 'photoTop' | 'card';
  cta?: {
    enabled: boolean;
    label?: string;
    action?: CtaAction;
  };
}

// Properties Block Settings
export interface PropertiesBlockSettings {
  propertyIds: string[]; // Selected property IDs
  layout: 'auto' | 'grid' | 'carousel' | 'hero';
  max: number; // Limit visible properties (1-6)
  show: {
    price: boolean;
    badges: boolean; // For Sale / For Rent / Coming Soon
    location: boolean;
    bedsBaths: boolean;
    cta: boolean;
  };
  ctaLabel: string;
  title?: string; // Section title
  subtitle?: string; // Section subtitle
  hideHeading?: boolean;
}

// Neighborhoods Block Settings
export interface NeighborhoodsBlockSettings {
  displayType: 'cards' | 'list' | 'grid';
  neighborhoodIds: string[]; // Selected neighborhood IDs
  showStats: boolean;
  ctaText: string;
  columns?: number;
}

// Testimonials Block Settings
export interface TestimonialsBlockSettings {
  displayType: 'carousel' | 'grid' | 'masonry';
  testimonialIds: string[] | 'all'; // Selected testimonial IDs or 'all'
  showPhotos: boolean;
  showRatings: boolean;
  showVideo: boolean;
  autoRotate: boolean;
  rotationSpeed?: number;
  limit?: number;
}

// Blog Block Settings
export interface BlogBlockSettings {
  displayType: 'cards' | 'list';
  filterBy: 'latest' | 'tag';
  tag?: string;
  limit: number;
  showExcerpt: boolean;
  showAuthor: boolean;
  showDate: boolean;
}

// Home Valuation Block Settings
export interface ValuationBlockSettings {
  headline: string;
  description: string;
  formFields: ('name' | 'email' | 'phone' | 'address')[];
  ctaText: string;
  successMessage: string;
  notificationEmail?: string;
  backgroundColor?: string;
}

// Mortgage Calculator Block Settings
export interface MortgageBlockSettings {
  defaultRate: number;
  defaultDownPayment: number;
  showLenderCta: boolean;
  lenderName?: string;
  lenderLink?: string;
  backgroundColor?: string;
}

// Lead Magnet Block Settings
export interface LeadMagnetBlockSettings {
  resourceId: string; // From resources manager
  headline: string;
  description: string;
  coverImageUrl?: string;
  formFields: ('name' | 'email' | 'phone')[];
  ctaText: string;
  backgroundColor?: string;
}

// Contact Block Settings
export interface ContactBlockSettings {
  headline: string;
  showPhone: boolean;
  phone?: string;
  showEmail: boolean;
  email?: string;
  showSchedule: boolean;
  scheduleLink?: string;
  showWhatsapp: boolean;
  whatsapp?: string;
  showContactForm: boolean;
  backgroundColor?: string;
}

// Social Footer Block Settings
export interface SocialFooterBlockSettings {
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  showBrokerageDisclosure: boolean;
  disclosureText?: string;
  showPoweredBy: boolean;
  backgroundColor?: string;
}

// Simple block types (existing)
export interface LinkBlockSettings {
  url: string;
  openInNewTab: boolean;
  icon?: string;
}

export interface ImageBlockSettings {
  imageUrl: string;
  caption?: string;
  link?: string;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
}

export interface VideoBlockSettings {
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  autoplay: boolean;
  loop: boolean;
}

export interface TextBlockSettings {
  content: string; // Rich text HTML
  alignment: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface SpacerBlockSettings {
  height: number; // in pixels
}

// Union type for all settings
export type HubBlockSettings =
  | HeroBlockSettings
  | AboutBlockSettings
  | PropertiesBlockSettings
  | NeighborhoodsBlockSettings
  | TestimonialsBlockSettings
  | BlogBlockSettings
  | ValuationBlockSettings
  | MortgageBlockSettings
  | LeadMagnetBlockSettings
  | ContactBlockSettings
  | SocialFooterBlockSettings
  | LinkBlockSettings
  | ImageBlockSettings
  | VideoBlockSettings
  | TextBlockSettings
  | SpacerBlockSettings;

// Helper type for block with settings
export interface HubBlock {
  id: string;
  hubId: string;
  type: HubBlockType;
  title?: string | null;
  subtitle?: string | null;
  url?: string | null;
  mediaUrl?: string | null;
  propertyId?: string | null;
  settingsJson?: HubBlockSettings | null;
  position: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Block metadata for UI
export interface BlockMetadata {
  type: HubBlockType;
  label: string;
  description: string;
  icon: string;
  category: 'essential' | 'lead_generation' | 'content' | 'tools' | 'custom';
  isPremium?: boolean;
}

// Block categories for organization
export const BLOCK_CATEGORIES = {
  essential: 'Essential',
  lead_generation: 'Lead Generation',
  content: 'Content',
  tools: 'Tools',
  custom: 'Custom',
} as const;

// Block metadata registry
export const BLOCK_METADATA: Record<HubBlockType, BlockMetadata> = {
  hero: {
    type: 'hero',
    label: 'Hero Section',
    description: 'Full-screen hero with video or image background',
    icon: 'Sparkles',
    category: 'essential',
  },
  about: {
    type: 'about',
    label: 'About Me',
    description: 'Profile photo, bio, and credentials',
    icon: 'User',
    category: 'essential',
  },
  properties: {
    type: 'properties',
    label: 'Properties',
    description: 'Showcase your listings with adaptive layouts',
    icon: 'Home',
    category: 'essential',
  },
  neighborhoods: {
    type: 'neighborhoods',
    label: 'Neighborhoods',
    description: 'Display areas you serve',
    icon: 'MapPin',
    category: 'content',
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Client reviews and social proof',
    icon: 'Star',
    category: 'content',
  },
  blog: {
    type: 'blog',
    label: 'Blog Posts',
    description: 'Share insights and market updates',
    icon: 'FileText',
    category: 'content',
  },
  valuation: {
    type: 'valuation',
    label: 'Home Valuation',
    description: 'Capture seller leads',
    icon: 'DollarSign',
    category: 'lead_generation',
  },
  mortgage: {
    type: 'mortgage',
    label: 'Mortgage Calculator',
    description: 'Interactive payment estimator',
    icon: 'Calculator',
    category: 'tools',
  },
  lead_magnet: {
    type: 'lead_magnet',
    label: 'Lead Magnet',
    description: 'Offer downloadable resources',
    icon: 'Download',
    category: 'lead_generation',
  },
  contact: {
    type: 'contact',
    label: 'Contact',
    description: 'Phone, email, and scheduling',
    icon: 'Phone',
    category: 'essential',
  },
  social_footer: {
    type: 'social_footer',
    label: 'Social Footer',
    description: 'Social links and disclosures',
    icon: 'Share2',
    category: 'essential',
  },
  property: {
    type: 'property',
    label: 'Single Property',
    description: 'Feature one specific property',
    icon: 'Building',
    category: 'custom',
  },
  link: {
    type: 'link',
    label: 'Link Button',
    description: 'Simple link with icon',
    icon: 'Link',
    category: 'custom',
  },
  image: {
    type: 'image',
    label: 'Image',
    description: 'Single image with caption',
    icon: 'Image',
    category: 'custom',
  },
  video: {
    type: 'video',
    label: 'Video',
    description: 'Embedded video player',
    icon: 'Video',
    category: 'custom',
  },
  text: {
    type: 'text',
    label: 'Text Block',
    description: 'Rich text content',
    icon: 'Type',
    category: 'custom',
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    description: 'Add vertical spacing',
    icon: 'Minus',
    category: 'custom',
  },
};
