import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { teams, teamMembers, agentProfiles, subscriptions, teamUsage, hubPages } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { validateSlug } from "@/lib/utils";

const createTeamSchema = z.object({
  slug: z.string().min(3).max(30),
  teamMode: z.enum(["solo", "multi"]),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { slug, teamMode, name } = createTeamSchema.parse(body);

    // Validate slug
    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create team
    const [team] = await db
      .insert(teams)
      .values({
        slug,
        name,
        teamMode,
      })
      .returning();

    // Create team membership (owner)
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: session.user.id,
      role: "owner",
    });

    // Create agent profile
    await db.insert(agentProfiles).values({
      teamId: team.id,
      userId: session.user.id,
      name: session.user.name || name,
      email: session.user.email || undefined,
      isVisible: true,
    });

    // Create subscription with trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    await db.insert(subscriptions).values({
      teamId: team.id,
      plan: "solo",
      status: "trialing",
      trialEndsAt,
    });

    // Initialize usage tracking
    await db.insert(teamUsage).values({
      teamId: team.id,
      propertiesLive: 0,
      videoMinutesUsed: 0,
    });

    // Create default hub page
    await db.insert(hubPages).values({
      teamId: team.id,
      title: `${name} Properties`,
      isPublic: true,
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        slug: team.slug,
        name: team.name,
        mode: team.teamMode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Team creation error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
