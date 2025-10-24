ALTER TABLE "neighborhood_media" ADD COLUMN "thumb_url" text;--> statement-breakpoint
ALTER TABLE "neighborhood_media" ADD COLUMN "provider" varchar(20);--> statement-breakpoint
ALTER TABLE "neighborhood_media" ADD COLUMN "provider_id" text;--> statement-breakpoint
ALTER TABLE "neighborhood_media" ADD COLUMN "duration_sec" integer;