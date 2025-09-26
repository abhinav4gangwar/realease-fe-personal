import mime from 'mime-types'

/**
 * Converts MIME type to user-friendly file type
 * @param mimeType - The MIME type (e.g., 'application/pdf')
 * @param fileName - Optional filename for fallback detection
 * @returns User-friendly file type (e.g., 'PDF', 'Word Document', 'Image')
 */
export function getFileTypeFromMime(mimeType: string, fileName?: string): string {
  // Handle null/undefined mimeType
  if (!mimeType || typeof mimeType !== 'string') {
    return 'File'
  }

  // Handle common cases with custom friendly names
  const friendlyTypes: Record<string, string> = {
    // Documents
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
    'text/plain': 'Text File',
    'text/csv': 'CSV File',
    'application/rtf': 'Rich Text Document',
    
    // Images
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'image/webp': 'WebP Image',
    'image/bmp': 'BMP Image',
    'image/tiff': 'TIFF Image',
    
    // Audio
    'audio/mpeg': 'MP3 Audio',
    'audio/wav': 'WAV Audio',
    'audio/ogg': 'OGG Audio',
    'audio/mp4': 'MP4 Audio',
    
    // Video
    'video/mp4': 'MP4 Video',
    'video/avi': 'AVI Video',
    'video/quicktime': 'QuickTime Video',
    'video/x-msvideo': 'AVI Video',
    'video/webm': 'WebM Video',
    
    // Archives
    'application/zip': 'ZIP Archive',
    'application/x-rar-compressed': 'RAR Archive',
    'application/x-7z-compressed': '7Z Archive',
    'application/gzip': 'GZIP Archive',
    'application/x-tar': 'TAR Archive',
    
    // Other
    'application/json': 'JSON File',
    'application/xml': 'XML File',
    'text/html': 'HTML File',
    'text/css': 'CSS File',
    'application/javascript': 'JavaScript File',
    'text/javascript': 'JavaScript File',
  }

  // Check if we have a custom friendly name
  if (friendlyTypes[mimeType]) {
    return friendlyTypes[mimeType]
  }

  // Try to get extension from mime-types library
  const extension = mime.extension(mimeType)
  if (extension) {
    return extension.toUpperCase()
  }

  // Fallback: try to extract from filename if provided
  if (fileName) {
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    if (fileExtension) {
      return fileExtension.toUpperCase()
    }
  }

  // Final fallback: parse the mime type
  if (mimeType.includes('/')) {
    const [category, subtype] = mimeType.split('/')
    
    // Handle broad categories
    switch (category) {
      case 'image':
        return 'Image'
      case 'video':
        return 'Video'
      case 'audio':
        return 'Audio'
      case 'text':
        return 'Text File'
      case 'application':
        // Try to make subtype more readable
        return subtype.replace(/[.-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      default:
        return 'File'
    }
  }

  return 'File'
}

/**
 * Gets file type category for grouping/filtering
 * @param mimeType - The MIME type
 * @returns Category ('document', 'image', 'video', 'audio', 'archive', 'other')
 */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
  ]
  
  const archiveTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar',
  ]
  
  if (documentTypes.includes(mimeType)) return 'document'
  if (archiveTypes.includes(mimeType)) return 'archive'
  if (mimeType.startsWith('text/')) return 'document'
  
  return 'other'
}

/**
 * Checks if a file type is an image
 * @param mimeType - The MIME type
 * @returns boolean
 */
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Checks if a file type is a PDF
 * @param mimeType - The MIME type
 * @returns boolean
 */
export function isPdfType(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}
