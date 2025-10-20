import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { properties, mediaAssets } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

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

    // Get property and verify ownership
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, params.id),
          eq(properties.teamId, session.user.teamId)
        )
      )
      .limit(1);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get all media assets to delete files
    const media = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.propertyId, params.id));

    // Delete media files from disk
    for (const item of media) {
      try {
        const filepath = join(process.cwd(), "public", item.url);
        await unlink(filepath);
      } catch (error) {
        console.error(`Failed to delete file ${item.url}:`, error);
        // Continue even if file deletion fails
      }
    }

    // Delete property (cascade will delete media_assets and property_agents)
    await db
      .delete(properties)
      .where(eq(properties.id, params.id));

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Property deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
