/**
 * Bunny.net Thumbnail Utilities
 * Bunny generates thumbnails at different timestamps automatically
 */

// Use the public env var since this runs on client-side
const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || 'vz-f199acbb-b12.b-cdn.net';

/**
 * Get available thumbnail URLs for a Bunny video
 * Bunny generates thumbnails at: 0%, 25%, 50%, 75%, 100% of video duration
 */
export function getBunnyThumbnailOptions(videoId: string): { url: string; label: string; timestamp: string }[] {
  if (!BUNNY_CDN_HOSTNAME) {
    console.error('BUNNY_CDN_HOSTNAME not configured');
    return [];
  }

  const baseUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}`;
  
  return [
    {
      url: `${baseUrl}/thumbnail.jpg`,
      label: 'Default',
      timestamp: '0%'
    },
    {
      url: `${baseUrl}/thumbnail_2.jpg`,
      label: 'Quarter',
      timestamp: '25%'
    },
    {
      url: `${baseUrl}/thumbnail_3.jpg`,
      label: 'Middle',
      timestamp: '50%'
    },
    {
      url: `${baseUrl}/thumbnail_4.jpg`,
      label: 'Three Quarters',
      timestamp: '75%'
    },
    {
      url: `${baseUrl}/thumbnail_5.jpg`,
      label: 'End',
      timestamp: '100%'
    }
  ];
}

/**
 * Get thumbnail URL at specific timestamp
 * @param videoId - Bunny video ID
 * @param thumbnailIndex - Index 1-5 (1 = default/0%, 2 = 25%, 3 = 50%, 4 = 75%, 5 = 100%)
 */
export function getBunnyThumbnailUrl(videoId: string, thumbnailIndex: number = 1): string {
  if (!BUNNY_CDN_HOSTNAME) {
    return '';
  }

  const baseUrl = `https://${BUNNY_CDN_HOSTNAME}/${videoId}`;
  
  if (thumbnailIndex === 1) {
    return `${baseUrl}/thumbnail.jpg`;
  }
  
  return `${baseUrl}/thumbnail_${thumbnailIndex}.jpg`;
}
