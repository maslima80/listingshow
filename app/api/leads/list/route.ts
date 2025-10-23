import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads, properties } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get filters from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Build query conditions
    const conditions = [eq(leads.teamId, session.user.teamId)];
    
    if (status && status !== 'all') {
      conditions.push(eq(leads.status, status as any));
    }
    
    if (propertyId) {
      conditions.push(eq(leads.propertyId, propertyId));
    }

    if (type) {
      conditions.push(eq(leads.type, type as any));
    }

    // Fetch leads with property info
    const leadsData = await db
      .select({
        id: leads.id,
        teamId: leads.teamId,
        propertyId: leads.propertyId,
        type: leads.type,
        name: leads.name,
        email: leads.email,
        phone: leads.phone,
        preferredDate: leads.preferredDate,
        preferredTimeWindow: leads.preferredTimeWindow,
        message: leads.message,
        status: leads.status,
        source: leads.source,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        property: {
          id: properties.id,
          title: properties.title,
          slug: properties.slug,
        },
      })
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(leads.createdAt))
      .limit(limit || 100);

    return NextResponse.json({
      leads: leadsData,
    });
  } catch (error) {
    console.error("Leads list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
