/**
 * Image Format Utilities for Transparent Background Support
 * Supports PNG, WebP, SVG, and other formats with transparency
 */

export interface ImageFormatSupport {
  supportsTransparency: boolean;
  format: string;
  mimeType: string;
  quality: 'high' | 'medium' | 'low';
}

/**
 * Detect image format from URL or file extension
 */
export function detectImageFormat(url: string): ImageFormatSupport {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'png':
      return {
        supportsTransparency: true,
        format: 'PNG',
        mimeType: 'image/png',
        quality: 'high'
      };
    
    case 'webp':
      return {
        supportsTransparency: true,
        format: 'WebP',
        mimeType: 'image/webp',
        quality: 'high'
      };
    
    case 'svg':
      return {
        supportsTransparency: true,
        format: 'SVG',
        mimeType: 'image/svg+xml',
        quality: 'high'
      };
    
    case 'gif':
      return {
        supportsTransparency: true,
        format: 'GIF',
        mimeType: 'image/gif',
        quality: 'medium'
      };
    
    case 'jpg':
    case 'jpeg':
      return {
        supportsTransparency: false,
        format: 'JPEG',
        mimeType: 'image/jpeg',
        quality: 'medium'
      };
    
    default:
      return {
        supportsTransparency: false,
        format: 'Unknown',
        mimeType: 'image/*',
        quality: 'low'
      };
  }
}

/**
 * Generate optimized image sources for different formats
 */
export function generateImageSources(baseUrl: string) {
  const format = detectImageFormat(baseUrl);
  
  const sources = [];
  
  // Add WebP version if not already WebP
  if (format.format !== 'WebP') {
    sources.push({
      srcSet: baseUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp'),
      type: 'image/webp'
    });
  }
  
  // Add AVIF version for ultra-modern browsers
  if (format.format !== 'AVIF') {
    sources.push({
      srcSet: baseUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.avif'),
      type: 'image/avif'
    });
  }
  
  return sources;
}

/**
 * Get CSS classes based on image format for optimal rendering
 */
export function getImageClasses(url: string): string {
  const format = detectImageFormat(url);
  
  const baseClasses = 'max-w-full max-h-full object-contain transition-all duration-500';
  
  if (format.supportsTransparency) {
    // For PNG, WebP, SVG, GIF - images with potential transparency
    return `${baseClasses} food-image transparent-image`;
  }
  
  // For JPEG and other formats without transparency
  return `${baseClasses} food-image solid-image`;
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

/**
 * Get the best image format URL based on browser support
 */
export function getBestImageUrl(baseUrl: string): string {
  if (typeof window === 'undefined') return baseUrl;
  
  const format = detectImageFormat(baseUrl);
  
  // If already optimal format, return as-is
  if (format.format === 'WebP' || format.format === 'SVG') {
    return baseUrl;
  }
  
  // Try WebP if supported
  if (supportsWebP()) {
    return baseUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }
  
  return baseUrl;
}

/**
 * Image loading error handler
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl: string = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
) {
  const target = event.target as HTMLImageElement;
  const originalSrc = target.src;
  
  // Prevent infinite loop if fallback also fails
  if (target.src === fallbackUrl) {
    console.error(`Both original and fallback image failed to load: ${originalSrc}`);
    return;
  }
  
  target.src = fallbackUrl;
  
  // Add error class for styling
  target.classList.add('image-error');
  target.classList.remove('transparent-optimized', 'transparent-shadow');
  
  console.warn(`Failed to load image: ${originalSrc}, using fallback: ${fallbackUrl}`);
} 