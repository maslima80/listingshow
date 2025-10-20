# Listing.Show - Development Plan

## Project Reset Strategy

### Step 0: Preparation (Now)
- [x] Archive current codebase
- [ ] Create new clean project structure
- [ ] Set up database schema
- [ ] Configure environment variables

---

## Phase 1: Foundation & Core Architecture (Days 1-5)

### Day 1: Database Schema & Auth Setup
**Goal:** Complete database foundation with all team-based tables

#### Tasks:
1. **Database Schema Design**
   - Create `team` table (id, slug, name, team_mode, created_at)
   - Create `team_member` table (id, team_id, user_id, role, joined_at)
   - Create `agent_profile` table (id, team_id, user_id, name, photo_url, bio, phone, whatsapp, email, is_visible)
   - Create `property` table (id, team_id, slug, title, description, price, location, beds, baths, area, status, created_at)
   - Create `property_agent` table (id, property_id, agent_profile_id, is_primary)
   - Create `media_asset` table (id, property_id, type, url, thumb_url, label, position, duration_sec, provider, provider_id)
   - Create `hub_page` table (id, team_id, title, is_public)
   - Create `hub_block` table (id, hub_id, type, title, subtitle, url, media_url, property_id, position, is_visible)
   - Create `theme` table (id, name, mode, tokens_json)
   - Create `team_theme` table (team_id, theme_id, accent_color)
   - Create `subscription` table (id, team_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
   - Create `team_usage` table (team_id, properties_live, video_minutes_used, updated_at)

2. **Auth.js Configuration**
   - Set up NextAuth with Credentials + Google providers
   - Configure session strategy
   - Add team context to session
   - Create auth callbacks for team membership

3. **Drizzle Setup**
   - Write complete schema.ts
   - Generate migrations
   - Push to Neon database
   - Test connections

**Deliverables:**
- ✅ Complete database schema
- ✅ Auth system with team support
- ✅ Database migrations applied

---

### Day 2: Onboarding Flow (Mode → Slug → Dashboard)
**Goal:** Complete user onboarding with team creation

#### Tasks:
1. **Sign Up Page**
   - Email/password form
   - Google OAuth button
   - Validation with Zod
   - Create user record

2. **Mode Selection Step**
   - Radio buttons: "I'm an independent agent" / "We're a team/agency"
   - Store selection in session
   - Clean, simple UI

3. **Slug Claim Step**
   - Input field with real-time validation
   - Check against reserved words: `['api', 'admin', 'p', 'u', 'signin', 'signup', 'pricing', 'dashboard', 'settings', 'onboarding']`
   - Check uniqueness in database
   - Regex validation: `^[a-z0-9-]{3,30}$`
   - Show suggestions if taken
   - Preview URL: `listing.show/u/<slug>`

4. **Team & Profile Creation**
   - Create team record (slug, mode)
   - Create team_member record (owner role)
   - Create agent_profile record (linked to user)
   - Set default theme (Dark Luxe + Gold accent)
   - Calculate trial end date (14 days)

5. **API Endpoints**
   - `POST /api/auth/signup` - Create user
   - `POST /api/slug/check` - Validate slug availability
   - `POST /api/onboarding/team` - Create team + membership + profile

**Deliverables:**
- ✅ Complete onboarding flow
- ✅ Team creation working
- ✅ Redirect to dashboard

---

### Day 3: Dashboard & Navigation
**Goal:** Card-based dashboard with navigation

#### Tasks:
1. **Dashboard Layout**
   - Header with logo + user menu
   - Trial banner (days remaining)
   - Card grid layout (responsive)

2. **Dashboard Cards**
   - **Create Property** - Launch builder
   - **Your Hub** - Edit link-in-bio page
   - **Agents** - Manage team members (if multi mode)
   - **Branding & Theme** - Switch Dark/Light + accent
   - **Billing & Usage** - Stripe plan + usage stats

3. **Mobile Navigation**
   - Bottom nav: Home · Properties · Hub · Billing · Account
   - Responsive breakpoints
   - Active state indicators

4. **Properties List View**
   - Grid of property cards
   - Status badges (draft/published)
   - Quick actions (edit, preview, publish)
   - Empty state with CTA

**Deliverables:**
- ✅ Dashboard with all cards
- ✅ Mobile navigation
- ✅ Properties list view

---

### Day 4: Theme System
**Goal:** Dark/Light Luxe themes with accent colors

#### Tasks:
1. **CSS Variables Setup**
   - Define semantic tokens: `--bg`, `--fg`, `--accent`, `--accent-on`, `--surface`, `--border`, `--muted`
   - Create theme variants in globals.css
   - Dark Luxe: graphite surfaces, gold accent #C9A66B
   - Light Luxe: soft white, champagne accent #B89A60

2. **Theme Seed Data**
   - Insert Dark Luxe theme into database
   - Insert Light Luxe theme into database
   - Define accent presets: Gold, Cobalt, Emerald, Ruby

3. **Theme Switcher Component**
   - Mode toggle (Dark/Light)
   - Accent color chips
   - Live preview
   - Save to team_theme table

4. **Theme Application**
   - Load team theme on app mount
   - Apply CSS variables dynamically
   - Persist selection
   - Apply to all pages

**Deliverables:**
- ✅ Theme system working
- ✅ Dark/Light modes
- ✅ Accent color switching

---

### Day 5: Hub Page Editor (Part 1 - Structure)
**Goal:** Hub page CRUD and block management

#### Tasks:
1. **Hub Page Model**
   - Create/read hub_page for team
   - Default title: "{Team Name} Properties"
   - Public/private toggle

2. **Block Types Definition**
   - Property reference (links to published property)
   - Link (title + URL)
   - Image (ImageKit URL)
   - Video embed (YouTube/Vimeo)
   - Text (paragraph)

3. **Block Management API**
   - `POST /api/hub/blocks` - Create block
   - `PUT /api/hub/blocks/:id` - Update block
   - `DELETE /api/hub/blocks/:id` - Delete block
   - `PUT /api/hub/blocks/reorder` - Update positions

4. **Editor UI (Basic)**
   - Block list with drag handles
   - Add block menu
   - Delete button per block
   - Visibility toggle per block

**Deliverables:**
- ✅ Hub page CRUD working
- ✅ Block management API
- ✅ Basic editor UI

---

## Phase 2: Core Features (Days 6-10)

### Day 6: Hub Page Editor (Part 2 - Polish)
**Goal:** Complete hub editor with preview

#### Tasks:
1. **Drag & Drop**
   - Install `@dnd-kit/core` or similar
   - Implement drag to reorder
   - Update positions on drop
   - Smooth animations

2. **Block Forms**
   - Property selector (dropdown of published properties)
   - Link form (title + URL validation)
   - Image uploader (ImageKit integration)
   - Video embed (URL parser for YouTube/Vimeo)
   - Text editor (simple textarea)

3. **Live Preview**
   - Split view (editor left, preview right)
   - Real-time updates
   - Mobile preview toggle
   - Theme preview

4. **Public Hub Page**
   - Route: `/u/[slug]/page.tsx`
   - Render all visible blocks
   - Apply team theme
   - Responsive layout

**Deliverables:**
- ✅ Drag & drop working
- ✅ All block types functional
- ✅ Live preview
- ✅ Public hub page rendering

---

### Day 7: Property Builder (Part 1 - Basics & Media)
**Goal:** Property creation with basic info and media upload

#### Tasks:
1. **Property Builder Wizard**
   - Step 1: Basics (title, location, price, description)
   - Step 2: Details (beds, baths, area, amenities)
   - Step 3: Media (videos + photos)
   - Step 4: Agents (assign team members)
   - Step 5: Publish

2. **Basics Form**
   - Title, subtitle, location
   - Price with currency selector
   - Description (textarea)
   - Auto-generate slug from title
   - Slug uniqueness check (per team)

3. **Details Form**
   - Beds, baths, parking (number inputs)
   - Area (sqm/sqft with unit toggle)
   - Amenities (multi-select chips)

4. **Media Upload Setup**
   - Bunny Stream account setup
   - ImageKit account setup
   - Generate signed upload URLs
   - Handle upload callbacks

**Deliverables:**
- ✅ Property wizard UI
- ✅ Basics & details forms
- ✅ Media upload infrastructure

---

### Day 8: Property Builder (Part 2 - Video Chapters)
**Goal:** Video upload with chapter labels

#### Tasks:
1. **Video Upload Component**
   - Drag & drop zone
   - Multiple file selection
   - Upload progress bars
   - Thumbnail generation

2. **Video Chapter System**
   - Label input per video ("The Kitchen", "Pool Area", etc.)
   - Reorder videos (drag & drop)
   - Set cover video
   - Duration tracking

3. **Bunny Stream Integration**
   - Direct upload to Bunny
   - Webhook endpoint for processing status
   - Store video ID and URLs
   - Thumbnail extraction

4. **Photo Gallery**
   - ImageKit upload
   - Grid layout
   - Set cover image
   - Reorder photos

**Deliverables:**
- ✅ Video upload working
- ✅ Chapter labels
- ✅ Bunny integration
- ✅ Photo gallery

---

### Day 9: Property Builder (Part 3 - Agents & Publish)
**Goal:** Agent assignment and publishing

#### Tasks:
1. **Agent Assignment**
   - List all agent_profiles in team
   - Select primary agent
   - Select co-agents (multi-select)
   - Create property_agent records

2. **Publish Flow**
   - Check plan limits (properties count)
   - Check video minutes usage
   - Set status = 'published'
   - Update team_usage
   - Generate share links

3. **Share Modal**
   - Copy link button
   - Instagram story link
   - WhatsApp share link
   - QR code (optional)

4. **Property Edit**
   - Load existing property data
   - Update all fields
   - Unpublish option

**Deliverables:**
- ✅ Agent assignment working
- ✅ Publish flow with limits
- ✅ Share modal
- ✅ Edit functionality

---

### Day 10: Public Property Page
**Goal:** Cinematic property showcase page

#### Tasks:
1. **Property Page Route**
   - `/p/[slug]/page.tsx`
   - Fetch property + agents + media
   - Apply team theme
   - SEO meta tags

2. **Hero Section**
   - Full-screen video or image
   - Property title overlay
   - Price badge
   - Gradient fade for readability

3. **Video Chapters**
   - Swipeable carousel (mobile)
   - Grid layout (desktop)
   - Chapter labels
   - Autoplay on scroll (optional)

4. **Property Details**
   - Key facts chips (beds, baths, area)
   - Description
   - Amenities list
   - Location

5. **Contact Drawer**
   - List all assigned agents
   - WhatsApp button
   - Call button
   - Email button
   - Agent photos and names

**Deliverables:**
- ✅ Public property page
- ✅ Video chapters swipeable
- ✅ Contact drawer
- ✅ Responsive layout

---

## Phase 3: Advanced Features (Days 11-15)

### Day 11: Multi-Agent Support
**Goal:** Team member management for multi mode

#### Tasks:
1. **Agents Management Page**
   - List all agent_profiles
   - Add new agent (with or without user account)
   - Edit agent details
   - Remove agent

2. **Invite System (Optional)**
   - Generate invite link
   - Email invite
   - Accept invite flow
   - Link agent_profile to user

3. **Agent Profile Form**
   - Name, photo, bio
   - Phone, WhatsApp, email
   - Visibility toggles
   - Social links

4. **Permissions (Basic)**
   - Owner: full access
   - Admin: manage properties + agents
   - Agent: manage own properties only

**Deliverables:**
- ✅ Agent management UI
- ✅ Add/edit/remove agents
- ✅ Basic permissions

---

### Day 12: Stripe Integration (Part 1 - Setup)
**Goal:** Stripe subscription setup

#### Tasks:
1. **Stripe Account Setup**
   - Create products: Solo ($39), Pro ($79), Agency ($159)
   - Set up pricing
   - Configure webhooks

2. **Subscription Model**
   - Create subscription record on team creation
   - Default status: 'trialing'
   - Trial period: 14 days

3. **Billing Page**
   - Show current plan
   - Show usage (properties, video minutes)
   - Upgrade/downgrade buttons
   - Cancel subscription

4. **Stripe Checkout**
   - Create checkout session
   - Redirect to Stripe
   - Handle success/cancel callbacks

**Deliverables:**
- ✅ Stripe products configured
- ✅ Checkout flow working
- ✅ Billing page

---

### Day 13: Stripe Integration (Part 2 - Webhooks)
**Goal:** Handle Stripe events and usage tracking

#### Tasks:
1. **Webhook Endpoint**
   - `POST /api/stripe/webhooks`
   - Verify signature
   - Handle events

2. **Event Handlers**
   - `checkout.session.completed` - Create subscription
   - `customer.subscription.updated` - Update status
   - `customer.subscription.deleted` - Cancel subscription
   - `invoice.payment_succeeded` - Confirm payment

3. **Usage Tracking**
   - Count published properties
   - Track video minutes from Bunny webhook
   - Update team_usage table
   - Enforce limits on publish

4. **Bunny Webhook**
   - `POST /api/bunny/webhooks`
   - Update video duration on encoding complete
   - Add to team_usage.video_minutes_used

**Deliverables:**
- ✅ Stripe webhooks working
- ✅ Subscription lifecycle handled
- ✅ Usage tracking
- ✅ Bunny webhook

---

### Day 14: Limits & Restrictions
**Goal:** Enforce plan limits

#### Tasks:
1. **Publish Checks**
   - Check properties_live < plan limit
   - Check video_minutes_used < plan limit
   - Show error if exceeded
   - Prompt to upgrade

2. **Trial Expiry**
   - Check trial_ends_at on publish
   - Block publishing if expired
   - Show upgrade modal

3. **Upgrade Prompts**
   - Modal component
   - Show current usage
   - Show plan comparison
   - CTA to billing page

4. **Usage Display**
   - Dashboard card with progress bars
   - Properties: X/Y live
   - Video: X/Y minutes used
   - Color coding (green/yellow/red)

**Deliverables:**
- ✅ Limits enforced
- ✅ Trial expiry handled
- ✅ Upgrade prompts
- ✅ Usage visualization

---

### Day 15: Polish & Testing
**Goal:** Bug fixes, performance, mobile optimization

#### Tasks:
1. **Mobile Optimization**
   - Test all pages on mobile
   - Fix responsive issues
   - Optimize touch targets
   - Test swipe gestures

2. **Performance**
   - Optimize images (next/image)
   - Lazy load videos
   - Code splitting
   - Caching strategy

3. **Error Handling**
   - Add error boundaries
   - User-friendly error messages
   - Retry mechanisms
   - Loading states

4. **Testing**
   - Test complete user flow
   - Test edge cases
   - Test payment flow (test mode)
   - Fix critical bugs

**Deliverables:**
- ✅ Mobile optimized
- ✅ Performance improved
- ✅ Error handling robust
- ✅ Critical bugs fixed

---

## Phase 4: Launch Prep (Days 16-20)

### Day 16-17: Additional Features
- Property search/filter on hub page
- Analytics (basic page views)
- Email notifications (property published, trial ending)
- SEO optimization (meta tags, sitemap)

### Day 18-19: Documentation & Admin
- User documentation
- Admin panel (basic)
- Monitoring setup
- Backup strategy

### Day 20: Launch
- Final testing
- Deploy to production
- DNS setup
- Go live! 🚀

---

## Tech Stack Confirmation

### Core
- **Frontend:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Neon (Postgres) + Drizzle ORM
- **Auth:** Auth.js (NextAuth) - Credentials + Google
- **Hosting:** Vercel

### Media & Services
- **Video:** Bunny Stream (transcoding + CDN)
- **Images:** ImageKit (optimization + delivery)
- **Payments:** Stripe (subscriptions)
- **Email:** Resend (transactional)

### Development
- **TypeScript:** Full type safety
- **Validation:** Zod
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit/core

---

## Environment Variables Needed

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Bunny Stream
BUNNY_STREAM_API_KEY=
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_WEBHOOK_SECRET=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
```

---

## Success Metrics

### MVP Launch (Day 20)
- [ ] User can sign up and create team
- [ ] User can claim unique slug
- [ ] User can create hub page with blocks
- [ ] User can create property with videos
- [ ] User can publish property
- [ ] Public pages render correctly
- [ ] Theme switching works
- [ ] Stripe trial starts automatically
- [ ] Usage limits enforced

### Post-Launch (Week 4-8)
- [ ] 10 teams signed up
- [ ] 50 properties published
- [ ] 3 paid subscriptions
- [ ] Mobile traffic > 60%
- [ ] Page load < 2s
- [ ] Zero critical bugs

---

## Next Steps

1. **Confirm this plan** - Any changes needed?
2. **Set up accounts** - Bunny, ImageKit, Stripe
3. **Start Day 1** - Database schema + auth
4. **Daily check-ins** - Review progress, adjust plan
5. **Ship fast** - MVP in 15-20 days

Ready to start? Let's build this! 🚀
