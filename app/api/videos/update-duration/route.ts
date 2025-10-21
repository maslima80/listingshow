import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

/**
 * Update video duration from Bunny.net
 * This should be called after video encoding is complete
 */
export async function POST(request: NextRequest) {
  try {
    const { videoId, mediaAssetId } = await request.json();

    if (!videoId || !mediaAssetId) {
      return NextResponse.json(
        { error: 'Missing videoId or mediaAssetId' },
        { status: 400 }
      );
    }

    // Fetch video details from Bunny
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video details from Bunny' },
        { status: response.status }
      );
    }

    const details = await response.json();
    const durationSec = Math.round(details.length || 0);

    // Update database
    await db
      .update(mediaAssets)
      .set({ durationSec })
      .where(eq(mediaAssets.id, mediaAssetId));

    return NextResponse.json({
      success: true,
      durationSec,
      status: details.status,
      encodeProgress: details.encodeProgress,
    });
  } catch (error) {
    console.error('Update duration error:', error);
    return NextResponse.json(
      { error: 'Failed to update duration', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
