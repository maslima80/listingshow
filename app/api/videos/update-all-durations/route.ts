import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

/**
 * Update all videos with missing durations
 */
export async function POST() {
  try {
    // Find all videos without duration
    const videosWithoutDuration = await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.type, 'video'),
          eq(mediaAssets.provider, 'bunny'),
          isNull(mediaAssets.durationSec)
        )
      );

    if (videosWithoutDuration.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All videos already have durations',
        updated: 0
      });
    }

    const updates = [];

    for (const video of videosWithoutDuration) {
      if (!video.providerId) {
        console.log(`Skipping video ${video.id} - no providerId`);
        continue;
      }

      try {
        // Fetch from Bunny
        const response = await fetch(
          `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${video.providerId}`,
          {
            headers: {
              'AccessKey': BUNNY_STREAM_API_KEY!,
            },
          }
        );

        if (!response.ok) {
          console.log(`Failed to fetch video ${video.providerId}`);
          continue;
        }

        const details = await response.json();
        const durationSec = Math.round(details.length || 0);

        if (durationSec > 0) {
          // Update database
          await db
            .update(mediaAssets)
            .set({ durationSec })
            .where(eq(mediaAssets.id, video.id));

          updates.push({
            id: video.id,
            providerId: video.providerId,
            durationSec,
            status: details.status,
          });

          console.log(`Updated video ${video.id} with duration ${durationSec}s`);
        }
      } catch (error) {
        console.error(`Error updating video ${video.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} video(s)`,
      updated: updates.length,
      updates
    });
  } catch (error) {
    console.error('Update all durations error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update durations', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
