-- Create enums for leads
CREATE TYPE "public"."lead_type" AS ENUM('tour_request', 'message');
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'in_progress', 'closed');
CREATE TYPE "public"."lead_time_window" AS ENUM('morning', 'afternoon', 'evening');

-- Create leads table
CREATE TABLE IF NOT EXISTS "leads" (
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

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "leads_team_id_idx" ON "leads" ("team_id");
CREATE INDEX IF NOT EXISTS "leads_property_id_idx" ON "leads" ("property_id");
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" ("status");
CREATE INDEX IF NOT EXISTS "leads_type_idx" ON "leads" ("type");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" ("created_at" DESC);
