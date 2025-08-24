import { getFileTypeFromMime } from '@/utils/fileTypeUtils'

interface FileTypeDisplayProps {
  mimeType?: string
  fileName?: string
  className?: string
  fallback?: string
}

/**
 * Component to display user-friendly file types
 * @param mimeType - The MIME type from the backend
 * @param fileName - Optional filename for fallback detection
 * @param className - Optional CSS classes
 * @param fallback - Fallback text if no type can be determined
 */
export function FileTypeDisplay({ 
  mimeType, 
  fileName, 
  className = '', 
  fallback = 'Unknown' 
}: FileTypeDisplayProps) {
  if (!mimeType) {
    return <span className={className}>{fallback}</span>
  }

  const friendlyType = getFileTypeFromMime(mimeType, fileName)
  
  return <span className={className}>{friendlyType}</span>
}

/**
 * Hook to get user-friendly file type
 * @param mimeType - The MIME type from the backend
 * @param fileName - Optional filename for fallback detection
 * @returns User-friendly file type string
 */
export function useFileType(mimeType?: string, fileName?: string): string {
  if (!mimeType) return 'Unknown'
  return getFileTypeFromMime(mimeType, fileName)
}
