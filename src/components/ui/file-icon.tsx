import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File,
  FileType,
  Presentation,
  FileX
} from 'lucide-react'
import { getFileCategory, getFileTypeFromMime } from '@/utils/fileTypeUtils'

interface FileIconProps {
  mimeType?: string
  className?: string
  size?: number
}

/**
 * Component to display appropriate icon based on file MIME type
 * @param mimeType - The MIME type from the backend
 * @param className - Optional CSS classes
 * @param size - Icon size (default: 16)
 */
export function FileIcon({ 
  mimeType, 
  className = '', 
  size = 16 
}: FileIconProps) {
  if (!mimeType) {
    return <File className={className} size={size} />
  }

  // Get the appropriate icon based on MIME type
  const getIcon = (mimeType: string) => {
    // Specific file types first
    if (mimeType === 'application/pdf') {
      return <FileText className={`${className} text-red-600`} size={size} />
    }
    
    if (mimeType === 'application/msword' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <FileText className={`${className} text-blue-600`} size={size} />
    }
    
    if (mimeType === 'application/vnd.ms-excel' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return <FileSpreadsheet className={`${className} text-green-600`} size={size} />
    }
    
    if (mimeType === 'application/vnd.ms-powerpoint' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return <Presentation className={`${className} text-orange-600`} size={size} />
    }
    
    if (mimeType === 'text/csv') {
      return <FileSpreadsheet className={`${className} text-green-500`} size={size} />
    }
    
    if (mimeType === 'text/plain') {
      return <FileText className={`${className} text-gray-600`} size={size} />
    }
    
    if (mimeType === 'application/json' || 
        mimeType === 'application/xml' ||
        mimeType === 'text/html' ||
        mimeType === 'text/css' ||
        mimeType === 'application/javascript' ||
        mimeType === 'text/javascript') {
      return <FileCode className={`${className} text-purple-600`} size={size} />
    }

    // Category-based icons
    const category = getFileCategory(mimeType)
    
    switch (category) {
      case 'image':
        return <FileImage className={`${className} text-pink-600`} size={size} />
      case 'video':
        return <FileVideo className={`${className} text-indigo-600`} size={size} />
      case 'audio':
        return <FileAudio className={`${className} text-yellow-600`} size={size} />
      case 'archive':
        return <FileArchive className={`${className} text-gray-700`} size={size} />
      case 'document':
        return <FileText className={`${className} text-blue-500`} size={size} />
      default:
        return <File className={`${className} text-gray-500`} size={size} />
    }
  }

  return getIcon(mimeType)
}

/**
 * Component that combines file icon with file type text
 */
interface FileTypeWithIconProps {
  mimeType?: string
  fileName?: string
  className?: string
  iconSize?: number
  showText?: boolean
}

export function FileTypeWithIcon({ 
  mimeType, 
  fileName, 
  className = '', 
  iconSize = 16,
  showText = true
}: FileTypeWithIconProps) {
  const friendlyType = mimeType ? getFileTypeFromMime(mimeType, fileName) : 'Unknown'
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FileIcon mimeType={mimeType} size={iconSize} />
      {showText && (
        <span className="text-sm text-gray-600">{friendlyType}</span>
      )}
    </div>
  )
}


