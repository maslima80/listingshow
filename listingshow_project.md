Listing.Show is a cinematic, video-first real-estate platform that lets agents and small teams create stunning, swipeable property pages — each one designed like a Netflix series episode.
Users can publish professional, mobile-optimized microsites for every property in minutes.

The platform includes:
	•	Self-serve onboarding (Solo or Team)
	•	Dashboard with cards (Hub, Properties, Agents, Billing)
	•	A link-in-bio-style Hub Page
	•	Cinematic Property Pages
	•	Team-level subscription & usage limits (Stripe)
	•	Fast theming via two curated modes (Dark / Light)

⸻

1. User Experience Flow

Step 0 – Choose Mode

Upon sign-up:

“How do you work?”
(•) I’m an independent agent
( ) We’re a team / agency

Creates team_mode = 'solo' | 'multi'.

⸻

Step 1 – Claim Your URL

User enters a unique handle:
→ listing.show/u/<slug>
	•	Real-time validation (regex + reserved words + availability).
	•	Creates:
	•	team (and team_member as owner)
	•	agent_profile (linked to the user)
	•	Default theme = Dark Luxe / accent = Gold

Redirect → /dashboard

⸻

Dashboard (Central Control)

Cards instead of complex menus:

Card	Description
Create Property	Launch the cinematic builder
Agents	Add or edit team members / profiles
Your Hub	Link-in-bio editor (drag & drop blocks)
Branding & Theme	Switch Dark/Light + accent presets
Billing & Usage	Manage Stripe plan & video minutes

Mobile bottom nav: Home · Properties · Hub · Billing · Account

⸻

Hub Page (Link-in-Bio for Agents/Teams)

Public: listing.show/u/<teamSlug>

Blocks available (MVP):
	•	Property reference (choose from published properties)
	•	Link (title + URL)
	•	Image (ImageKit)
	•	Video Embed (YouTube/Vimeo)
	•	Text (paragraph)

Editor:
	•	Add blocks via menu → drag to reorder
	•	Toggle visibility
	•	Live preview on right
	•	Theme toggle (Dark/Light) + accent chips (Gold, Cobalt, …)

Data model:
	•	hub_page(id, team_id, title, is_public)
	•	hub_block(id, hub_id, type, title, subtitle, url, media_url, property_id, position, is_visible)

⸻

Property Pages (Video-First Showcase)

Public: listing.show/p/<propertySlug>

Steps in Builder:
	1.	Basics – title, city, price, description
	2.	Media – upload short vertical clips (Bunny) + optional gallery (ImageKit)
	3.	Agents – select one or more agent_profile (primary / co-agents)
	4.	Publish – instantly live + share modal (Copy, Instagram, WhatsApp)

Public layout:
	•	Hero video or image
	•	Swipeable video chapters (“The Kitchen,” “The Pool,” etc.)
	•	Key facts chips (beds, baths, area)
	•	Description
	•	Contact drawer listing all assigned agents (WhatsApp/Call/Email)

⸻

2. Slug & URL Strategy

Hub slugs (/u/<slug>)
	•	Globally unique (team.slug UNIQUE)
	•	Regex: ^[a-z0-9-]{3,30}$
	•	Reserved words blocked (api, admin, p, u, signin, signup, pricing, dashboard, …)
	•	Suggestions generated if taken.

Property slugs (/p/<propertySlug>)
	•	Unique per team: (team_id, slug) UNIQUE
	•	Publicly visible as short /p/<slug>
	•	Fallback redirect from canonical /u/<teamSlug>/p/<slug> if ever needed.
	•	Auto-append suffix (-2, -3) if duplicate within team.

⸻

3. Multi-Realtor Architecture

Table	Purpose
user	Auth identity (email, Google)
team	Main account (solo or multi)
team_member	Relationship between users & team (role: owner, admin, agent)
agent_profile	Display profile for each agent (may or may not map to a user)
property	Listing record
property_agent	Join table linking properties ↔ agents
media_asset	Bunny/ImageKit assets
hub_page / hub_block	Link-in-bio structure
theme / team_theme	Stores dark/light variants & accent
subscription	Stripe details
team_usage	Track minutes used, properties live


Flow:
	•	Solo users are just 1-member teams.
	•	Teams can add more agent_profile and link them to user accounts later.
	•	Properties can display multiple agents via property_agent.

⸻

4. Theme System

MVP
	•	Two modes: Dark Luxe (default) and Light Luxe
	•	Accent presets: Gold, Cobalt
	•	Stored at team level: team_theme(theme_id, accent)
	•	All UI colors use CSS variables (semantic tokens):
	•	--bg, --fg, --accent, --accent-on, etc.

Future (Admin Theme Builder)
	•	Admin can insert new rows in theme table (tokens JSON)
	•	Teams automatically see new options in Theme picker

⸻

5. Billing & Usage

Plan	Monthly	Limits
Solo	$39	2 live properties, 30 min video
Pro	$79	5 properties, 60 min video
Agency	$159	15 properties, 150 min video



	•	Team-level subscription (Stripe).
	•	Bunny webhook updates video duration → team_usage.video_minutes_used.
	•	Publishing checks against plan limits

6. API Overview

Endpoint	Function
POST /api/slug/check	Validate uniqueness for team + property slugs
POST /api/onboarding/team	Create team (mode, slug), membership, default theme
POST /api/agent/self	Create initial agent_profile
GET/POST /api/hub	Create/update hub_page
POST /api/hub/blocks	CRUD hub blocks
POST /api/properties	Create basic property
POST /api/properties/:id/media	Signed uploads (Bunny)
POST /api/properties/:id/agents	Assign agents
POST /api/properties/:id/publish	Publish property
POST /api/stripe/webhooks	Handle subscription & usage events
POST /api/bunny/webhooks	Update video durations


7. Tech Stack

Layer	Tool	Reason
Frontend	Next.js (App Router) + Tailwind + shadcn/ui	SEO, fast theming, responsive
DB	Neon (Postgres) + Drizzle ORM	Typed schema, simple migrations
Auth	Auth.js (Google + Email)	Secure & minimal
Video	Bunny Stream	Fast transcoding + global CDN
Images	ImageKit	Optimization + delivery
Payments	Stripe	Subscriptions, trials
Hosting	Vercel	Automatic subdomains + edge speed
Theme tokens	CSS variables	Easy dark/light switch & accent control

8. Design System
	•	Dark Luxe: graphite surfaces, gold accent #C9A66B, off-white text.
	•	Light Luxe: soft white, champagne accent #B89A60, graphite text.
	•	Typography: Serif (Fraunces/Canela) for headings + Sans (Inter/Söhne) for body.
	•	Motion: subtle 120–180 ms ease-out transitions.
	•	Spacing: 8 px baseline, large radii (rounded-2xl).
	•	Contrast guard: automatic text color swap based on background luminance.
	•	Hero overlays: gradient fade for readability over video/images.

⸻

9. Key UX Principles
	1.	Zero friction — onboarding ends after mode + slug.
	2.	Visual clarity — card-based dashboard instead of deep menus.
	3.	True ownership — every agent/team gets their own hub URL.
	4.	Video-first storytelling — swipeable vertical clips, cinematic layout.
	5.	Instant sharing — property URLs optimized for social & WhatsApp.
	6.	Scalable architecture — same flow serves solos and multi-realtor teams.

⸻

10. Example Data Flow (Property Creation)
	1.	Agent clicks Create Property → /dashboard/properties/new
	2.	Fills basic info → POST /api/properties
	3.	Uploads clips → Bunny direct upload
→ Bunny webhook → updates media_asset.duration_sec
	4.	Adds co-agents → POST /api/properties/:id/agents
	5.	Publishes → checks plan limits → sets is_published = true
	6.	Page instantly live at /p/<slug> + cached via Bunny CDN.

⸻

11. Deployment Targets
	•	Frontend → Vercel (with wildcard subdomain readiness)
	•	Database → Neon
	•	Media → Bunny Stream (videos) + ImageKit (images)
	•	Payments → Stripe (webhooks on Vercel Edge functions)
	•	Domains → listing.show main, agent.listing.show subdomains (later)

⸻

12. Deliverables for Dev Sprint 1
	1.	Auth + Onboarding (mode + slug)
	2.	Dashboard shell with 5 cards
	3.	Hub editor (blocks CRUD + preview)
	4.	Property builder (basic info + media + publish)
	5.	Public pages (/u/<slug>, /p/<slug>)
	6.	Stripe trial integration
	7.	Bunny upload + webhook
	8.	Theme toggle (Dark/Light)

⸻

In One Sentence

Listing.Show lets real-estate pros — solo or in teams — create cinematic, video-driven property pages and a branded link-in-bio hub in minutes, all inside one sleek, mobile-first platform