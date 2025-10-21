import { pgTable, text, timestamp, uuid, pgEnum, boolean, integer, numeric, varchar, serial, unique, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const teamModeEnum = pgEnum('team_mode', ['solo', 'multi']);
export const teamMemberRoleEnum = pgEnum('team_member_role', ['owner', 'admin', 'agent']);
export const propertyStatusEnum = pgEnum('property_status', ['draft', 'published']);
export const mediaTypeEnum = pgEnum('media_type', ['photo', 'video']);
export const hubBlockTypeEnum = pgEnum('hub_block_type', ['property', 'link', 'image', 'video', 'text']);
export const themeModeEnum = pgEnum('theme_mode', ['dark', 'light']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled', 'expired']);
export const planTypeEnum = pgEnum('plan_type', ['solo', 'pro', 'agency']);

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
  photoUrl: text('photo_url'),
  bio: text('bio'),
  phone: varchar('phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  email: text('email'),
  socialLinks: jsonb('social_links'), // { instagram: "...", linkedin: "...", website: "..." }
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
  price: numeric('price', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  beds: integer('beds'),
  baths: numeric('baths', { precision: 3, scale: 1 }),
  parking: integer('parking'),
  areaSqm: numeric('area_sqm', { precision: 10, scale: 2 }),
  areaSqft: numeric('area_sqft', { precision: 10, scale: 2 }),
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
  position: integer('position').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
