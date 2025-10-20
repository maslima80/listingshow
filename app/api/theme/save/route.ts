import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { teamThemes, themes } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

const saveThemeSchema = z.object({
  teamId: z.string().uuid(),
  mode: z.enum(["dark", "light"]),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
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
    const { teamId, mode, accentColor } = saveThemeSchema.parse(body);

    // Verify user has access to this team
    if (session.user.teamId !== teamId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get or create theme based on mode
    const themeName = mode === "dark" ? "Dark Luxe" : "Light Luxe";
    let [theme] = await db
      .select()
      .from(themes)
      .where(eq(themes.name, themeName))
      .limit(1);

    if (!theme) {
      // Create default theme if it doesn't exist
      const tokensJson = mode === "dark" 
        ? {
            background: "240 10% 3.9%",
            foreground: "0 0% 98%",
            card: "240 10% 7%",
            muted: "240 3.7% 15.9%",
            border: "240 3.7% 15.9%",
          }
        : {
            background: "0 0% 100%",
            foreground: "240 10% 3.9%",
            card: "0 0% 100%",
            muted: "240 4.8% 95.9%",
            border: "240 5.9% 90%",
          };

      [theme] = await db
        .insert(themes)
        .values({
          name: themeName,
          mode,
          tokensJson,
        })
        .returning();
    }

    // Upsert team theme
    const existing = await db
      .select()
      .from(teamThemes)
      .where(eq(teamThemes.teamId, teamId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(teamThemes)
        .set({
          themeId: theme.id,
          accentColor,
          updatedAt: new Date(),
        })
        .where(eq(teamThemes.teamId, teamId));
    } else {
      await db.insert(teamThemes).values({
        teamId,
        themeId: theme.id,
        accentColor,
      });
    }

    return NextResponse.json({
      success: true,
      theme: {
        mode,
        accentColor,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Theme save error:", error);
    return NextResponse.json(
      { error: "Failed to save theme" },
      { status: 500 }
    );
  }
}
