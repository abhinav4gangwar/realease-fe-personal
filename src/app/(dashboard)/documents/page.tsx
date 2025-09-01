'use client'

import { apiClient } from '@/utils/api'
import { getFileTypeFromMime } from '@/utils/fileTypeUtils'
import { useEffect, useState } from 'react'
import { DocumentViewer } from './_components/document-viewer'

const Documentspage = () => {
  const [fetchedDocuments, setFetchedDocuments] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/dashboard/documents/list')
        setFetchedDocuments(response.data)
        console.log('Fetched documents:', response.data)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    fetchDocuments()
  }, [])

  // Transform API response to match component expectations
  const transformApiResponse = (apiData: any) => {
    if (!apiData || !apiData.children) return []
    return apiData.children.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      icon:
        item.type === 'folder'
          ? 'folder'
          : getFileTypeFromMimeType(item.mimeType),
      linkedProperty: item.linkedProperty || 'No Property',
      dateAdded: formatDate(item.modifiedOn),
      dateModified: formatDate(item.modifiedOn),
      lastOpened: formatDate(item.modifiedOn),
      fileType: item.mimeType || 'Unknown',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      isFolder: item.type === 'folder',
      hasChildren: item.hasChildren,
      children: [], // Will be populated when folder is clicked
      size: item.size,
      s3Key: item.s3Key,
      parentId: item.parentId,
    }))
  }

  const getFileTypeFromMimeType = (mimeType: string, fileName?: string) => {
    if (!mimeType) return 'file'

    // Use our utility function to get user-friendly file type
    const friendlyType = getFileTypeFromMime(mimeType, fileName)

    // Map friendly types back to icon types for FileIcon component
    const iconTypeMap: Record<string, string> = {
      PDF: 'pdf',
      'Word Document': 'word',
      'Excel Spreadsheet': 'excel',
      'PowerPoint Presentation': 'powerpoint',
      'JPEG Image': 'img',
      'PNG Image': 'img',
      'GIF Image': 'img',
      'SVG Image': 'img',
      'WebP Image': 'img',
      'BMP Image': 'img',
      'TIFF Image': 'img',
      'ZIP Archive': 'zip',
      'RAR Archive': 'rar',
      'Text File': 'txt',
      'JSON File': 'json',
      'HTML File': 'html',
      'CSS File': 'css',
      'JavaScript File': 'js',
    }

    return iconTypeMap[friendlyType] || friendlyType.toLowerCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const transformedDocuments = transformApiResponse(fetchedDocuments)

  return (
    <div>
      {/* for desktop */}
      <div className='lg:block hidden'>
        <DocumentViewer
          // recentlyAccessed={documentsData.recentlyAccessed}
          allFiles={transformedDocuments}
          apiClient={apiClient}
          transformApiResponse={transformApiResponse}
        />
      </div>

      {/* for mobile */}
      <div className='lg:hidden block pt-14'>
       
      </div>
    </div>
  )
}

export default Documentspage
