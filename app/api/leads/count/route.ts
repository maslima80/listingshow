import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    const conditions = [eq(leads.teamId, session.user.teamId)];
    
    if (status && ['new', 'contacted', 'in_progress', 'closed'].includes(status)) {
      conditions.push(eq(leads.status, status as any));
    }

    // Count leads
    const result = await db
      .select({ count: leads.id })
      .from(leads)
      .where(and(...conditions));

    return NextResponse.json({
      count: result.length,
    });
  } catch (error) {
    console.error("Failed to count leads:", error);
    return NextResponse.json(
      { error: "Failed to count leads" },
      { status: 500 }
    );
  }
}
