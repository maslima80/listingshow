import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaAssets, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Update video thumbnail URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaAssetId, thumbnailUrl } = await request.json();

    if (!mediaAssetId || !thumbnailUrl) {
      return NextResponse.json(
        { error: 'Missing mediaAssetId or thumbnailUrl' },
        { status: 400 }
      );
    }

    // Get media asset and verify ownership through property
    const [mediaAsset] = await db
      .select({
        id: mediaAssets.id,
        propertyId: mediaAssets.propertyId,
        teamId: properties.teamId,
      })
      .from(mediaAssets)
      .innerJoin(properties, eq(mediaAssets.propertyId, properties.id))
      .where(eq(mediaAssets.id, mediaAssetId))
      .limit(1);

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    if (mediaAsset.teamId !== session.user.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update thumbnail URL
    await db
      .update(mediaAssets)
      .set({ thumbUrl: thumbnailUrl })
      .where(eq(mediaAssets.id, mediaAssetId));

    return NextResponse.json({
      success: true,
      message: 'Thumbnail updated successfully',
    });
  } catch (error) {
    console.error('Update thumbnail error:', error);
    return NextResponse.json(
      { error: 'Failed to update thumbnail', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
