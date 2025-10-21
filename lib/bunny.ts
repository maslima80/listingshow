/**
 * Bunny.net Stream API Integration
 * For video hosting, encoding, and CDN delivery
 */

// Bunny.net Stream API configuration
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || '';
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || '';
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || '';

interface BunnyUploadResponse {
  guid: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: any[];
  hasMP4Fallback: boolean;
  collectionId: string;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string;
  chapters: any[];
  moments: any[];
  metaTags: any[];
}

/**
 * Upload video to Bunny.net Stream
 * @param videoBuffer - Video file buffer
 * @param title - Video title
 * @param collectionId - Optional collection ID to organize videos
 */
export async function uploadToBunny(
  videoBuffer: Buffer,
  title: string,
  collectionId?: string
): Promise<{ videoId: string; thumbnailUrl: string; streamUrl: string; hlsUrl: string; durationSec: number }> {
  try {
    if (!BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID) {
      throw new Error('Bunny.net credentials not configured');
    }

    // Step 1: Create video object (make it public by default)
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          isPublic: true, // Make video publicly accessible
        }),
      }
    );
    
    console.log('Bunny.net create response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create video: ${errorText}`);
    }

    const videoData: BunnyUploadResponse = await createResponse.json();
    const videoId = videoData.guid;

    // Step 2: Upload video file
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: videoBuffer,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload video: ${errorText}`);
    }

    // Step 3: Fetch video details to get actual playback URLs
    const detailsResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY,
        },
      }
    );

    if (!detailsResponse.ok) {
      console.error('Failed to fetch video details, using fallback URLs');
      // Fallback to constructed URLs
      const thumbnailUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
      const streamUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&preload=true`;
      const hlsUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
      return { videoId, thumbnailUrl, streamUrl, hlsUrl, durationSec: 0 };
    }

    const details = await detailsResponse.json();
    
    // Return both iframe URL (for fullscreen player) and HLS URL (for preview)
    const thumbnailUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
    const streamUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&preload=true`;
    const hlsUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
    // Bunny returns duration in 'length' field (seconds) - may be 0 if still encoding
    const durationSec = Math.round(details.length || 0);
    
    console.log('Bunny.net video uploaded:', {
      videoId,
      thumbnailUrl,
      streamUrl,
      durationSec,
      status: details.status,
      encodeProgress: details.encodeProgress
    });

    return {
      videoId,
      thumbnailUrl,
      streamUrl,
      hlsUrl,
      durationSec,
    };
  } catch (error) {
    console.error('Bunny.net upload error:', error);
    throw new Error('Failed to upload video to Bunny.net');
  }
}

/**
 * Delete video from Bunny.net
 * @param videoId - Bunny.net video GUID
 */
export async function deleteFromBunny(videoId: string): Promise<void> {
  try {
    if (!BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID) {
      throw new Error('Bunny.net credentials not configured');
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete video: ${errorText}`);
    }
  } catch (error) {
    console.error('Bunny.net delete error:', error);
    throw new Error('Failed to delete video from Bunny.net');
  }
}

/**
 * Get video info from Bunny.net
 * @param videoId - Bunny.net video GUID
 */
export async function getBunnyVideoInfo(videoId: string): Promise<BunnyUploadResponse> {
  try {
    if (!BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID) {
      throw new Error('Bunny.net credentials not configured');
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: 'GET',
        headers: {
          'AccessKey': BUNNY_STREAM_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get video info: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Bunny.net get video info error:', error);
    throw new Error('Failed to get video info from Bunny.net');
  }
}

/**
 * Generate Bunny.net video player URL
 * @param videoId - Bunny.net video GUID
 */
export function getBunnyPlayerUrl(videoId: string): string {
  if (!BUNNY_CDN_HOSTNAME) {
    console.warn('Bunny.net CDN hostname not configured');
    return '';
  }
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

/**
 * Generate Bunny.net stream URL (iframe embed)
 * @param videoId - Bunny.net video GUID
 */
export function getBunnyStreamUrl(videoId: string): string {
  if (!BUNNY_LIBRARY_ID) {
    console.warn('Bunny.net Library ID not configured');
    return '';
  }
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=true&preload=true`;
}

/**
 * Generate Bunny.net thumbnail URL
 * @param videoId - Bunny.net video GUID
 */
export function getBunnyThumbnailUrl(videoId: string): string {
  if (!BUNNY_CDN_HOSTNAME) {
    console.warn('Bunny.net CDN hostname not configured');
    return '';
  }
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}
