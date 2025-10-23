import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads, properties, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { notifyLeadReceived } from "@/lib/notifications";

// Validation schema
const createLeadSchema = z.object({
  propertyId: z.string().uuid(),
  type: z.enum(['tour_request', 'message']),
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(160),
  phone: z.string().max(40).optional(),
  preferredDate: z.string().optional(), // ISO date string
  preferredTimeWindow: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(64).optional(),
});

// Helper to hash IP for rate limiting
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 64);
}

// Public endpoint to create a lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = createLeadSchema.parse(body);

    // Look up property to get teamId
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, validated.propertyId),
      columns: {
        id: true,
        teamId: true,
        title: true,
        slug: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get user agent and IP for basic tracking
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const ipHash = ip !== 'unknown' ? hashIP(ip) : undefined;

    // Basic rate limiting: check if same IP submitted in last 5 minutes
    if (ipHash) {
      const recentLeads = await db.query.leads.findFirst({
        where: (leads, { and, eq, gt }) => and(
          eq(leads.ipHash, ipHash),
          gt(leads.createdAt, new Date(Date.now() - 5 * 60 * 1000))
        ),
      });

      if (recentLeads) {
        return NextResponse.json(
          { error: "Please wait a few minutes before submitting another request" },
          { status: 429 }
        );
      }
    }

    // Create the lead
    const [lead] = await db
      .insert(leads)
      .values({
        teamId: property.teamId,
        propertyId: validated.propertyId,
        type: validated.type,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
        preferredTimeWindow: validated.preferredTimeWindow || null,
        message: validated.message || null,
        source: validated.source || null,
        userAgent: userAgent,
        ipHash: ipHash,
        status: 'new',
      })
      .returning();

    // Get team info for notification
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, property.teamId),
      columns: {
        name: true,
      },
    });

    // Send notification (console log for now, Resend integration ready)
    try {
      await notifyLeadReceived(
        {
          id: lead.id,
          type: lead.type,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          preferredDate: lead.preferredDate,
          preferredTimeWindow: lead.preferredTimeWindow,
          message: lead.message,
          source: lead.source,
        },
        {
          title: property.title,
          slug: property.slug,
        },
        {
          name: team?.name || 'Team',
        }
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Lead creation error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
