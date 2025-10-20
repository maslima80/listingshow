import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSlug, generateSlugSuggestions } from "@/lib/utils";

const checkSlugSchema = z.object({
  slug: z.string().min(3).max(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = checkSlugSchema.parse(body);

    // Validate slug format
    const validation = validateSlug(slug);
    if (!validation.valid) {
      return NextResponse.json(
        {
          available: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Check if slug exists in database
    const existing = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      const suggestions = generateSlugSuggestions(slug);
      return NextResponse.json({
        available: false,
        error: "This URL is already taken",
        suggestions,
      });
    }

    return NextResponse.json({
      available: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { available: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Slug check error:", error);
    return NextResponse.json(
      { available: false, error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
