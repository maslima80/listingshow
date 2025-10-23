ALTER TABLE "agent_profiles" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "bio_long" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "calendly_url" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "stats_json" jsonb;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "credentials" jsonb;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "service_areas" jsonb;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "brokerage_name" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "license_number" text;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD COLUMN "disclosure_text" text;