import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Get the 5 most recent videos
    const videos = await db
      .select({
        id: mediaAssets.id,
        propertyId: mediaAssets.propertyId,
        label: mediaAssets.label,
        url: mediaAssets.url,
        thumbUrl: mediaAssets.thumbUrl,
        provider: mediaAssets.provider,
        providerId: mediaAssets.providerId,
        processing: mediaAssets.processing,
        createdAt: mediaAssets.createdAt,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.type, 'video'))
      .orderBy(desc(mediaAssets.createdAt))
      .limit(5);

    return NextResponse.json({
      success: true,
      count: videos.length,
      videos: videos,
      note: "Check the 'url' field - it should be iframe.mediadelivery.net format"
    });
  } catch (error) {
    console.error('Debug videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
