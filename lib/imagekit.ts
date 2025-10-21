import ImageKit from 'imagekit';

// ImageKit configuration
// You'll need to add these to your .env file:
// IMAGEKIT_PUBLIC_KEY=your_public_key
// IMAGEKIT_PRIVATE_KEY=your_private_key
// IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

// Server-side ImageKit instance (for uploads)
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

// Client-side configuration (for displaying images)
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
};

/**
 * Generate ImageKit URL with transformations
 * @param path - Image path in ImageKit
 * @param transformations - ImageKit transformations (width, height, quality, etc.)
 */
export function getImageKitUrl(
  path: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    focus?: 'auto' | 'face' | 'center';
  }
): string {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) return path;
  
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || imagekitConfig.urlEndpoint;
  
  if (!urlEndpoint) {
    console.warn('ImageKit URL endpoint not configured');
    return path;
  }
  
  // Build transformation string
  const transforms: string[] = [];
  
  if (transformations?.width) transforms.push(`w-${transformations.width}`);
  if (transformations?.height) transforms.push(`h-${transformations.height}`);
  if (transformations?.quality) transforms.push(`q-${transformations.quality}`);
  if (transformations?.format) transforms.push(`f-${transformations.format}`);
  if (transformations?.crop) transforms.push(`c-${transformations.crop}`);
  if (transformations?.focus) transforms.push(`fo-${transformations.focus}`);
  
  const transformString = transforms.length > 0 ? `tr:${transforms.join(',')}` : '';
  
  // Construct URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return transformString 
    ? `${urlEndpoint}/${transformString}${cleanPath}`
    : `${urlEndpoint}${cleanPath}`;
}

/**
 * Upload image to ImageKit
 * @param file - File buffer or base64 string
 * @param fileName - Name for the file
 * @param folder - Folder path in ImageKit
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = '/properties'
): Promise<{ url: string; fileId: string; filePath: string }> {
  try {
    const response = await imagekit.upload({
      file,
      fileName,
      folder,
      useUniqueFileName: true,
    });
    
    return {
      url: response.url,
      fileId: response.fileId,
      filePath: response.filePath,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
}

/**
 * Delete image from ImageKit
 * @param fileId - ImageKit file ID
 */
export async function deleteFromImageKit(fileId: string): Promise<void> {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image from ImageKit');
  }
}
