import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { properties, mediaAssets } from "@/lib/db/schema";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { deleteFromBunny } from "@/lib/bunny";

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

    // Get all media assets to delete from Bunny.net
    const media = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.propertyId, params.id));

    // Delete videos from Bunny.net
    const deletionResults = {
      total: media.length,
      deleted: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const item of media) {
      // Only delete videos from Bunny (photos are stored locally or elsewhere)
      if (item.type === 'video' && item.providerId) {
        try {
          await deleteFromBunny(item.providerId);
          deletionResults.deleted++;
          console.log(`✓ Deleted Bunny video: ${item.providerId}`);
        } catch (error) {
          deletionResults.failed++;
          const errorMsg = `Failed to delete Bunny video ${item.providerId}: ${error instanceof Error ? error.message : String(error)}`;
          deletionResults.errors.push(errorMsg);
          console.error(errorMsg);
          // Continue even if Bunny deletion fails - we still want to delete from DB
        }
      }
    }

    // Delete property (cascade will delete media_assets and property_agents)
    await db
      .delete(properties)
      .where(eq(properties.id, params.id));

    console.log('Media deletion summary:', deletionResults);

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
      mediaDeletion: {
        total: deletionResults.total,
        deleted: deletionResults.deleted,
        failed: deletionResults.failed,
        ...(deletionResults.errors.length > 0 && { errors: deletionResults.errors }),
      },
    });
  } catch (error) {
    console.error("Property deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
