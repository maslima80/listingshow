import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'closed']).optional(),
  notes: z.string().max(5000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updateLeadSchema.parse(body);

    // Verify lead belongs to user's team
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, params.id),
        eq(leads.teamId, session.user.teamId)
      ),
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Update the lead
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validated.status !== undefined) {
      updateData.status = validated.status;
    }

    if (validated.notes !== undefined) {
      updateData.notes = validated.notes;
    }

    const [updatedLead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, params.id))
      .returning();

    return NextResponse.json({
      ok: true,
      lead: updatedLead,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Lead update error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.teamId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify lead belongs to user's team
    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, params.id),
        eq(leads.teamId, session.user.teamId)
      ),
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Delete the lead
    await db
      .delete(leads)
      .where(eq(leads.id, params.id));

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Lead deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
