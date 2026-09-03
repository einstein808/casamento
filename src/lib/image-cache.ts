import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload to save bandwidth and storage
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.6,          // Maximum 600 KB
    maxWidthOrHeight: 1920,  // Max 1080p / 1920px
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.warn('Image compression fallback to original:', error);
    return file;
  }
}

/**
 * Cache an image in browser cache storage
 */
export async function cacheImageLocally(url: string): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open('casamento-photos-v1');
    await cache.add(url);
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Pre-cache a list of image URLs in background
 */
export function preloadAndCacheImages(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    if (!url) return;
    const img = new Image();
    img.src = url;
    cacheImageLocally(url);
  });
}
