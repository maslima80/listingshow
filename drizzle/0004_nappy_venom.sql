ALTER TABLE "subscriptions" ADD COLUMN "video_minutes_limit" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "video_minutes_used" integer DEFAULT 0 NOT NULL;