// Utility functions for handling Supabase storage images

/**
 * Extracts the filename from a Supabase storage URL
 * @param url - The full Supabase storage URL
 * @returns The filename or null if extraction fails
 */
export function extractFileNameFromUrl(url: string): string | null {
  if (!url) return null
  
  try {
    // Supabase storage URLs typically follow this pattern:
    // https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
    const urlParts = url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Remove any query parameters
    const fileName = lastPart.split('?')[0]
    
    return fileName || null
  } catch (error) {
    console.error('Error extracting filename from URL:', error)
    return null
  }
}

/**
 * Checks if a URL is a Supabase storage URL from our menu-images bucket
 * @param url - The URL to check
 * @returns True if it's from our bucket, false otherwise
 */
export function isMenuImageUrl(url: string): boolean {
  if (!url) return false
  
  try {
    return url.includes('/storage/v1/object/public/menu-images/')
  } catch (error) {
    return false
  }
}

/**
 * Validates if an image file type is allowed
 * @param fileType - The MIME type of the file
 * @returns True if allowed, false otherwise
 */
export function isValidImageType(fileType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(fileType)
}

/**
 * Validates if a file size is within limits
 * @param fileSize - The size of the file in bytes
 * @param maxSizeMB - Maximum size in MB (default: 5)
 * @returns True if within limits, false otherwise
 */
export function isValidFileSize(fileSize: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return fileSize <= maxSizeBytes
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
