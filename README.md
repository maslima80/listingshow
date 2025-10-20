# Listing.Show

> A cinematic, video-first real-estate platform for agents and teams

## 🚧 Project Status

**Currently in Development - Fresh Start (Day 1)**

We've archived the previous implementation and started fresh with the correct team-based architecture.

### ✅ Completed (Day 1 - In Progress)
- [x] Fresh Next.js 15 project setup
- [x] Complete database schema with team architecture
- [x] Auth.js configuration with team support
- [x] Utility functions (slug validation, formatting)
- [x] Dependencies installed

### 🔄 Current Phase: Foundation
- [ ] Generate and push database migrations
- [ ] Create initial theme seed data
- [ ] Build sign-up flow
- [ ] Build onboarding (mode selection → slug claim)
- [ ] Create dashboard shell

## 📚 Documentation

- See `DEVELOPMENT_PLAN.md` for the complete 20-day development roadmap
- See `listingshow_project.md` for the full project specification

## 🛠 Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Neon (Postgres) + Drizzle ORM
- **Auth:** NextAuth.js (Credentials + Google)
- **Video:** Bunny Stream (coming soon)
- **Images:** ImageKit (coming soon)
- **Payments:** Stripe (coming soon)

## 🚀 Getting Started

### Prerequisites

1. Node.js 20+ installed
2. Neon database account
3. Environment variables configured

### Environment Setup

Create a `.env` file:

```env
# Database
DATABASE_URL=your_neon_database_url

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Bunny Stream (coming soon)
BUNNY_STREAM_API_KEY=
BUNNY_STREAM_LIBRARY_ID=

# ImageKit (coming soon)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Stripe (coming soon)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
listing-show/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (signin, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── onboarding/        # Onboarding flow
│   ├── u/[slug]/          # Public hub pages
│   ├── p/[slug]/          # Public property pages
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and config
│   ├── db/               # Database schema and connection
│   ├── auth.ts           # Auth configuration
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
└── drizzle/              # Database migrations
```

## 🗄 Database Schema

The project uses a team-centric architecture:

- **teams** - Main account (solo or multi mode)
- **team_members** - User-team relationships
- **agent_profiles** - Display profiles for agents
- **properties** - Property listings
- **property_agents** - Property-agent assignments
- **media_assets** - Photos and videos
- **hub_pages** - Link-in-bio pages
- **hub_blocks** - Hub page content blocks
- **themes** - Theme definitions
- **team_themes** - Team theme selections
- **subscriptions** - Stripe subscriptions
- **team_usage** - Usage tracking

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🎯 Next Steps

1. Complete database setup and migrations
2. Build authentication flows
3. Implement onboarding
4. Create dashboard
5. Build hub page editor
6. Implement property builder

See `DEVELOPMENT_PLAN.md` for the complete roadmap.

## 📄 License

Private project - All rights reserved
