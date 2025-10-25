import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads, properties, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { notifyLeadReceived } from "@/lib/notifications";

// Validation schema
const createLeadSchema = z.object({
  propertyId: z.string().uuid().optional(), // Optional for hub blocks
  teamId: z.string().uuid().optional(), // For hub blocks without property
  type: z.enum(['tour_request', 'message', 'valuation']),
  name: z.string().min(2, "Name must be at least 2 characters").max(120).optional(), // Optional for valuation (uses contact.name)
  email: z.string().email("Invalid email address").max(160).optional(), // Optional for valuation (uses contact.email)
  phone: z.string().max(40).optional(),
  preferredDate: z.string().optional(), // ISO date string
  preferredTimeWindow: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(64).optional(),
  // Valuation-specific fields
  property: z.object({
    address: z.string().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    squareFeet: z.number().optional(),
    condition: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  contact: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    preferredContact: z.string().optional(),
    bestTime: z.string().optional(),
  }).optional(),
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

    // Additional validation: ensure name/email are provided (either top-level or in contact)
    if (validated.type !== 'valuation') {
      if (!validated.name || !validated.email) {
        return NextResponse.json(
          { error: "Name and email are required" },
          { status: 400 }
        );
      }
    } else {
      // For valuation, require contact object with name and email
      if (!validated.contact || !validated.contact.name || !validated.contact.email) {
        return NextResponse.json(
          { error: "Contact information is required for valuation" },
          { status: 400 }
        );
      }
    }

    // Determine teamId - either from property or directly provided (hub blocks)
    let targetTeamId: string;
    let property: { id: string; teamId: string; title: string; slug: string } | undefined;

    if (validated.propertyId) {
      // Property-specific lead
      const prop = await db.query.properties.findFirst({
        where: eq(properties.id, validated.propertyId),
        columns: {
          id: true,
          teamId: true,
          title: true,
          slug: true,
        },
      });

      if (!prop) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      property = prop;
      targetTeamId = prop.teamId;
    } else if (validated.teamId) {
      // Hub block lead (no property)
      targetTeamId = validated.teamId;
    } else {
      return NextResponse.json(
        { error: "Either propertyId or teamId is required" },
        { status: 400 }
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

    // Prepare lead data
    let leadName = validated.name;
    let leadEmail = validated.email;
    let leadPhone = validated.phone || null;
    let leadMessage = validated.message || null;

    // For valuation leads, extract from nested contact object
    if (validated.type === 'valuation' && validated.contact) {
      leadName = validated.contact.name;
      leadEmail = validated.contact.email;
      leadPhone = validated.contact.phone || null;
      // Store property details in message field for now
      if (validated.property) {
        leadMessage = JSON.stringify({
          property: validated.property,
          contact: {
            preferredContact: validated.contact.preferredContact,
            bestTime: validated.contact.bestTime,
          },
        });
      }
    }

    // Create the lead
    const [lead] = await db
      .insert(leads)
      .values({
        teamId: targetTeamId,
        propertyId: validated.propertyId || null,
        type: validated.type,
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
        preferredTimeWindow: validated.preferredTimeWindow || null,
        message: leadMessage,
        source: validated.source || null,
        userAgent: userAgent,
        ipHash: ipHash,
        status: 'new',
      })
      .returning();

    // Get team info for notification
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, targetTeamId),
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
        property ? {
          title: property.title,
          slug: property.slug,
        } : undefined,
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
