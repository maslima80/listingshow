import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

/**
 * Poll for video duration updates
 * Checks Bunny API every 30 seconds for up to 5 minutes
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

    // Start polling in background (don't wait for response)
    pollForDuration(videoId, mediaAssetId);

    return NextResponse.json({
      success: true,
      message: 'Duration polling started',
    });
  } catch (error) {
    console.error('Poll duration error:', error);
    return NextResponse.json(
      { error: 'Failed to start polling', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Background polling function
 */
async function pollForDuration(videoId: string, mediaAssetId: string) {
  const maxAttempts = 10; // 10 attempts over 5 minutes
  const pollInterval = 30000; // 30 seconds
  let attempts = 0;

  console.log(`[Duration Polling] Started for video ${videoId}`);

  const poll = async () => {
    attempts++;
    
    try {
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
        console.error(`[Duration Polling] Failed to fetch video ${videoId}, attempt ${attempts}/${maxAttempts}`);
        return false;
      }

      const details = await response.json();
      const durationSec = Math.round(details.length || 0);
      const encodeProgress = details.encodeProgress || 0;
      const status = details.status;

      console.log(`[Duration Polling] Video ${videoId} - Duration: ${durationSec}s, Progress: ${encodeProgress}%, Status: ${status}, Attempt: ${attempts}/${maxAttempts}`);

      // If we have a duration, update the database
      if (durationSec > 0) {
        await db
          .update(mediaAssets)
          .set({ durationSec })
          .where(eq(mediaAssets.id, mediaAssetId));

        console.log(`[Duration Polling] ✅ Updated video ${videoId} with duration ${durationSec}s`);
        return true; // Success - stop polling
      }

      // If encoding is complete but still no duration, something is wrong
      if (status === 4 && encodeProgress === 100) {
        console.warn(`[Duration Polling] ⚠️ Video ${videoId} is encoded but has no duration`);
        return true; // Stop polling
      }

      return false; // Continue polling
    } catch (error) {
      console.error(`[Duration Polling] Error polling video ${videoId}:`, error);
      return false;
    }
  };

  // Initial poll after 10 seconds (give Bunny time to start encoding)
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const success = await poll();
  if (success) return;

  // Continue polling every 30 seconds
  const intervalId = setInterval(async () => {
    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      console.log(`[Duration Polling] ⏱️ Max attempts reached for video ${videoId}`);
      return;
    }

    const success = await poll();
    if (success) {
      clearInterval(intervalId);
    }
  }, pollInterval);
}
