import { pgTable, text, timestamp, uuid, pgEnum, boolean, integer, numeric, varchar, serial, unique, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const teamModeEnum = pgEnum('team_mode', ['solo', 'multi']);
export const teamMemberRoleEnum = pgEnum('team_member_role', ['owner', 'admin', 'agent']);
export const propertyStatusEnum = pgEnum('property_status', ['draft', 'published']);
export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video']);
export const hubBlockTypeEnum = pgEnum('hub_block_type', [
  'hero',
  'about',
  'properties',
  'neighborhoods',
  'testimonials',
  'blog',
  'valuation',
  'mortgage',
  'lead_magnet',
  'contact',
  'social_footer',
  'property',
  'link',
  'image',
  'video',
  'text',
  'spacer'
]);
export const themeModeEnum = pgEnum('theme_mode', ['dark', 'light']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired']);
export const planTypeEnum = pgEnum('plan_type', ['solo', 'pro', 'agency']);
export const listingPurposeEnum = pgEnum('listing_purpose', ['sale', 'rent', 'coming_soon']);
export const propertyTypeEnum = pgEnum('property_type', ['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'lot', 'commercial', 'other']);
export const priceVisibilityEnum = pgEnum('price_visibility', ['show', 'upon_request', 'contact']);
export const leadTypeEnum = pgEnum('lead_type', ['tour_request', 'message']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'in_progress', 'closed']);
export const leadTimeWindowEnum = pgEnum('lead_time_window', ['morning', 'afternoon', 'evening']);
export const neighborhoodMediaTypeEnum = pgEnum('neighborhood_media_type', ['photo', 'video']);
export const testimonialStatusEnum = pgEnum('testimonial_status', ['pending', 'approved', 'rejected']);

// ============================================================================
// USER & AUTH
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: text('password_hash'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// TEAM ARCHITECTURE
// ============================================================================

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 30 }).notNull().unique(),
  name: text('name').notNull(),
  teamMode: teamModeEnum('team_mode').notNull().default('solo'),
  videoMinutesUsed: integer('video_minutes_used').notNull().default(0), // Total video minutes uploaded
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: teamMemberRoleEnum('role').notNull().default('agent'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueTeamUser: unique().on(t.teamId, t.userId),
}));

export const agentProfiles = pgTable('agent_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  title: text('title'), // Professional title (e.g., "Luxury Real Estate Specialist")
  tagline: text('tagline'), // Short headline (e.g., "Luxury Homes Specialist in Miami")
  photoUrl: text('photo_url'),
  bio: text('bio'), // Short bio (2-3 sentences)
  bioLong: text('bio_long'), // Long bio for About section
  videoUrl: text('video_url'), // Video introduction (YouTube/Vimeo)
  phone: varchar('phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  email: text('email'),
  calendlyUrl: text('calendly_url'), // Scheduling link
  socialLinks: jsonb('social_links'), // { instagram, facebook, linkedin, youtube, tiktok, website }
  statsJson: jsonb('stats_json'), // { years_in_business, homes_sold, volume }
  credentials: jsonb('credentials'), // Array of certifications/awards
  serviceAreas: jsonb('service_areas'), // Array of neighborhood IDs they serve
  brokerageName: text('brokerage_name'),
  licenseNumber: text('license_number'),
  disclosureText: text('disclosure_text'), // Legal disclosure
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// PROPERTIES
// ============================================================================

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 80 }).notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  location: text('location').notNull(),
  listingPurpose: listingPurposeEnum('listing_purpose').default('sale').notNull(),
  propertyType: propertyTypeEnum('property_type'),
  price: numeric('price', { precision: 12, scale: 2 }),
  priceVisibility: priceVisibilityEnum('price_visibility').default('show').notNull(),
  rentPeriod: varchar('rent_period', { length: 20 }), // 'month', 'week', 'night'
  currency: varchar('currency', { length: 3 }).default('USD'),
  beds: integer('beds'),
  baths: numeric('baths', { precision: 3, scale: 1 }),
  parking: integer('parking'),
  areaSqm: numeric('area_sqm', { precision: 10, scale: 2 }),
  areaSqft: numeric('area_sqft', { precision: 10, scale: 2 }),
  yearBuilt: integer('year_built'),
  hoaDues: numeric('hoa_dues', { precision: 10, scale: 2 }),
  hoaPeriod: varchar('hoa_period', { length: 20 }), // 'month', 'quarter', 'year'
  amenities: text('amenities').array(),
  externalLinks: jsonb('external_links'),
  status: propertyStatusEnum('status').default('draft').notNull(),
  coverAssetId: uuid('cover_asset_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (t) => ({
  uniqueTeamSlug: unique().on(t.teamId, t.slug),
}));

export const propertyAgents = pgTable('property_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  agentProfileId: uuid('agent_profile_id').notNull().references(() => agentProfiles.id, { onDelete: 'cascade' }),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniquePropertyAgent: unique().on(t.propertyId, t.agentProfileId),
}));

// ============================================================================
// MEDIA ASSETS
// ============================================================================

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  type: mediaTypeEnum('type').notNull(),
  label: varchar('label', { length: 100 }),
  url: text('url').notNull(),
  thumbUrl: text('thumb_url'),
  position: integer('position').default(0).notNull(),
  durationSec: integer('duration_sec'),
  provider: varchar('provider', { length: 20 }),
  providerId: text('provider_id'),
  processing: boolean('processing').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// HUB PAGE (Link-in-Bio)
// ============================================================================

export const hubPages = pgTable('hub_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }).unique(),
  title: text('title').notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const hubBlocks = pgTable('hub_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  hubId: uuid('hub_id').notNull().references(() => hubPages.id, { onDelete: 'cascade' }),
  type: hubBlockTypeEnum('type').notNull(),
  title: text('title'),
  subtitle: text('subtitle'),
  url: text('url'),
  mediaUrl: text('media_url'),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }),
  settingsJson: jsonb('settings_json'), // Block-specific configuration
  position: integer('position').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// NEIGHBORHOODS (HYPERLOCAL CONTENT)
// ============================================================================

export const neighborhoods = pgTable('neighborhoods', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  tagline: text('tagline'),
  description: text('description'), // Rich text content
  coverImageUrl: text('cover_image_url'),
  heroVideoUrl: text('hero_video_url'),
  statsJson: jsonb('stats_json'), // { median_price, schools_rating, walkability, etc. }
  isPublished: boolean('is_published').default(false).notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueTeamSlug: unique().on(t.teamId, t.slug),
}));

export const neighborhoodMedia = pgTable('neighborhood_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  neighborhoodId: uuid('neighborhood_id').notNull().references(() => neighborhoods.id, { onDelete: 'cascade' }),
  type: neighborhoodMediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  caption: text('caption'),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// TESTIMONIALS (SOCIAL PROOF)
// ============================================================================

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  clientName: text('client_name').notNull(),
  clientLocation: text('client_location'),
  clientPhotoUrl: text('client_photo_url'),
  testimonialText: text('testimonial_text').notNull(),
  rating: integer('rating'), // 1-5 stars
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
  videoUrl: text('video_url'), // For video testimonials
  status: testimonialStatusEnum('status').default('pending').notNull(),
  submissionToken: varchar('submission_token', { length: 64 }).unique(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const testimonialRequests = pgTable('testimonial_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  clientEmail: text('client_email').notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  submitted: boolean('submitted').default(false).notNull(),
});

// ============================================================================
// RESOURCES (LEAD MAGNETS)
// ============================================================================

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  fileUrl: text('file_url').notNull(), // PDF or external link
  fileSize: integer('file_size'), // In bytes
  downloadCount: integer('download_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const resourceDownloads = pgTable('resource_downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceId: uuid('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  leadName: text('lead_name').notNull(),
  leadEmail: text('lead_email').notNull(),
  leadPhone: text('lead_phone'),
  downloadedAt: timestamp('downloaded_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// ============================================================================
// THEME SYSTEM
// ============================================================================

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  mode: themeModeEnum('mode').notNull(),
  tokensJson: jsonb('tokens_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const teamThemes = pgTable('team_themes', {
  teamId: uuid('team_id').primaryKey().references(() => teams.id, { onDelete: 'cascade' }),
  themeId: uuid('theme_id').notNull().references(() => themes.id),
  accentColor: varchar('accent_color', { length: 7 }).default('#C9A66B').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }).unique(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  plan: planTypeEnum('plan').default('solo').notNull(),
  status: subscriptionStatusEnum('status').default('trialing').notNull(),
  videoMinutesLimit: integer('video_minutes_limit').notNull().default(30), // Plan-based video quota (minutes)
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const teamUsage = pgTable('team_usage', {
  teamId: uuid('team_id').primaryKey().references(() => teams.id, { onDelete: 'cascade' }),
  propertiesLive: integer('properties_live').default(0).notNull(),
  videoMinutesUsed: integer('video_minutes_used').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// LEADS (Light CRM)
// ============================================================================

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
  type: leadTypeEnum('type').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 40 }),
  preferredDate: timestamp('preferred_date', { withTimezone: true }),
  preferredTimeWindow: leadTimeWindowEnum('preferred_time_window'),
  message: text('message'),
  status: leadStatusEnum('status').default('new').notNull(),
  source: varchar('source', { length: 64 }), // e.g., 'hero_cta', 'player_info', 'contact_form'
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash', { length: 64 }),
  notes: text('notes'), // Internal agent notes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// RELATIONS (for Drizzle ORM queries)
// ============================================================================

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(teamMembers),
  agentProfiles: many(agentProfiles),
  properties: many(properties),
  hubPage: one(hubPages),
  theme: one(teamThemes),
  subscription: one(subscriptions),
  usage: one(teamUsage),
  leads: many(leads),
  neighborhoods: many(neighborhoods),
  testimonials: many(testimonials),
  testimonialRequests: many(testimonialRequests),
  resources: many(resources),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMemberships: many(teamMembers),
  agentProfiles: many(agentProfiles),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  team: one(teams, {
    fields: [properties.teamId],
    references: [teams.id],
  }),
  agents: many(propertyAgents),
  mediaAssets: many(mediaAssets),
  leads: many(leads),
}));

export const agentProfilesRelations = relations(agentProfiles, ({ one, many }) => ({
  team: one(teams, {
    fields: [agentProfiles.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [agentProfiles.userId],
    references: [users.id],
  }),
  propertyAssignments: many(propertyAgents),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  team: one(teams, {
    fields: [leads.teamId],
    references: [teams.id],
  }),
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
}));

export const hubPagesRelations = relations(hubPages, ({ one, many }) => ({
  team: one(teams, {
    fields: [hubPages.teamId],
    references: [teams.id],
  }),
  blocks: many(hubBlocks),
}));

export const hubBlocksRelations = relations(hubBlocks, ({ one }) => ({
  hub: one(hubPages, {
    fields: [hubBlocks.hubId],
    references: [hubPages.id],
  }),
  property: one(properties, {
    fields: [hubBlocks.propertyId],
    references: [properties.id],
  }),
}));

export const neighborhoodsRelations = relations(neighborhoods, ({ one, many }) => ({
  team: one(teams, {
    fields: [neighborhoods.teamId],
    references: [teams.id],
  }),
  media: many(neighborhoodMedia),
}));

export const neighborhoodMediaRelations = relations(neighborhoodMedia, ({ one }) => ({
  neighborhood: one(neighborhoods, {
    fields: [neighborhoodMedia.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  team: one(teams, {
    fields: [testimonials.teamId],
    references: [teams.id],
  }),
  property: one(properties, {
    fields: [testimonials.propertyId],
    references: [properties.id],
  }),
}));

export const testimonialRequestsRelations = relations(testimonialRequests, ({ one }) => ({
  team: one(teams, {
    fields: [testimonialRequests.teamId],
    references: [teams.id],
  }),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  team: one(teams, {
    fields: [resources.teamId],
    references: [teams.id],
  }),
  downloads: many(resourceDownloads),
}));

export const resourceDownloadsRelations = relations(resourceDownloads, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceDownloads.resourceId],
    references: [resources.id],
  }),
}));
