import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq, and, or, like } from "drizzle-orm";

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || '516385';

export async function POST() {
  try {
    console.log('🔍 Finding videos with old Bunny.net URL format...');

    // Find all videos with old CDN URL format OR autoplay=false
    const oldVideos = await db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.type, 'video'),
          eq(mediaAssets.provider, 'bunny'),
          or(
            like(mediaAssets.url, '%b-cdn.net%'),
            like(mediaAssets.url, '%autoplay=false%')
          )
        )
      );

    if (oldVideos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No videos need updating!',
        updated: 0
      });
    }

    const updates = [];

    for (const video of oldVideos) {
      if (!video.providerId) {
        console.log(`Skipping video ${video.id} - no providerId`);
        continue;
      }

      const videoId = video.providerId;
      const oldUrl = video.url;
      const newUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&preload=true`;
      
      console.log(`Updating video ${video.id}:`);
      console.log(`  Old: ${oldUrl}`);
      console.log(`  New: ${newUrl}`);
      
      // Update the URL
      await db
        .update(mediaAssets)
        .set({ url: newUrl })
        .where(eq(mediaAssets.id, video.id));
      
      updates.push({
        id: video.id,
        oldUrl,
        newUrl
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updates.length} video(s)`,
      updated: updates.length,
      updates
    });
  } catch (error) {
    console.error('Fix Bunny URLs error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix video URLs', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
