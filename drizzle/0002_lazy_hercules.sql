CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."lead_time_window" AS ENUM('morning', 'afternoon', 'evening');--> statement-breakpoint
CREATE TYPE "public"."lead_type" AS ENUM('tour_request', 'message');--> statement-breakpoint
CREATE TYPE "public"."listing_purpose" AS ENUM('sale', 'rent', 'coming_soon');--> statement-breakpoint
CREATE TYPE "public"."neighborhood_media_type" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."price_visibility" AS ENUM('show', 'upon_request', 'contact');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'lot', 'commercial', 'other');--> statement-breakpoint
CREATE TYPE "public"."testimonial_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"property_id" uuid,
	"type" "lead_type" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(40),
	"preferred_date" timestamp with time zone,
	"preferred_time_window" "lead_time_window",
	"message" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"source" varchar(64),
	"user_agent" text,
	"ip_hash" varchar(64),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neighborhood_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"neighborhood_id" uuid NOT NULL,
	"type" "neighborhood_media_type" NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"tagline" text,
	"description" text,
	"cover_image_url" text,
	"hero_video_url" text,
	"stats_json" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "neighborhoods_team_id_slug_unique" UNIQUE("team_id","slug")
);
--> statement-breakpoint
CREATE TABLE "resource_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"lead_name" text NOT NULL,
	"lead_email" text NOT NULL,
	"lead_phone" text,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"file_url" text NOT NULL,
	"file_size" integer,
	"download_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonial_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"client_email" text NOT NULL,
	"token" varchar(64) NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "testimonial_requests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"client_name" text NOT NULL,
	"client_location" text,
	"client_photo_url" text,
	"testimonial_text" text NOT NULL,
	"rating" integer,
	"property_id" uuid,
	"video_url" text,
	"status" "testimonial_status" DEFAULT 'pending' NOT NULL,
	"submission_token" varchar(64),
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testimonials_submission_token_unique" UNIQUE("submission_token")
);
--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "baths" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "hub_blocks" ADD COLUMN "settings_json" jsonb;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listing_purpose" "listing_purpose" DEFAULT 'sale' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "property_type" "property_type";--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "price_visibility" "price_visibility" DEFAULT 'show' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rent_period" varchar(20);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "year_built" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "hoa_dues" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "hoa_period" varchar(20);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "external_links" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhood_media" ADD CONSTRAINT "neighborhood_media_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial_requests" ADD CONSTRAINT "testimonial_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;