/**
 * Script to fix old Bunny.net video URLs to use the new iframe embed format
 * 
 * Run with: npx tsx scripts/fix-bunny-urls.ts
 */

import { db } from "../lib/db";
import { mediaAssets } from "../lib/db/schema";
import { eq, and, like } from "drizzle-orm";

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || '516385';

async function fixBunnyUrls() {
  console.log('🔍 Finding videos with old Bunny.net URL format...\n');

  // Find all videos with the old CDN URL format
  const oldVideos = await db
    .select()
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.type, 'video'),
        eq(mediaAssets.provider, 'bunny'),
        like(mediaAssets.url, '%b-cdn.net%')
      )
    );

  if (oldVideos.length === 0) {
    console.log('✅ No videos need updating!');
    return;
  }

  console.log(`Found ${oldVideos.length} video(s) to update:\n`);

  for (const video of oldVideos) {
    console.log(`📹 Video ID: ${video.id}`);
    console.log(`   Old URL: ${video.url}`);
    
    // Extract video ID from old URL
    // Format: https://vz-f199acbb-b12.b-cdn.net/{videoId}/playlist.m3u8
    const videoIdMatch = video.url.match(/\/([a-f0-9-]+)\/playlist\.m3u8/);
    
    if (!videoIdMatch || !video.providerId) {
      console.log(`   ⚠️  Could not extract video ID, skipping...\n`);
      continue;
    }

    const videoId = video.providerId; // Use providerId which should have the correct GUID
    const newUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&preload=true`;
    
    console.log(`   New URL: ${newUrl}`);
    
    // Update the URL
    await db
      .update(mediaAssets)
      .set({ url: newUrl })
      .where(eq(mediaAssets.id, video.id));
    
    console.log(`   ✅ Updated!\n`);
  }

  console.log(`\n🎉 Successfully updated ${oldVideos.length} video(s)!`);
  console.log('\n💡 Tip: Refresh your property pages to see the videos playing.');
}

// Run the script
fixBunnyUrls()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
