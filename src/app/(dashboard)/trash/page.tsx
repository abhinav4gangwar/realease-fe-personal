'use client'

import { apiClient } from '@/utils/api'
import { useEffect, useState } from 'react'
import { TrashDocumentViewer } from './_components/trash-document-viewer'

const TrashPage = () => {
  const [fetchedDocuments, setFetchedDocuments] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/dashboard/bin/list/documents')
        setFetchedDocuments(response.data)
        console.log('Fetched documents:', response.data)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    fetchDocuments()
  }, [])

  const transformApiResponse = (apiData: any) => {
    if (!apiData || !apiData.documents) return []
    return apiData.documents.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      icon:
        item.type === 'folder'
          ? 'folder'
          : getFileTypeFromMimeType(item.mimeType),
      linkedProperty: item.linkedProperty || 'No Property',
      dateAdded: formatDate(item.modifiedOn),
      dateModified: formatDate(item.modifiedOn),
      lastOpened: formatDate(item.lastOpened), 
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

  const getFileTypeFromMimeType = (mimeType: string) => {
    if (!mimeType) return 'file'
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('word') || mimeType.includes('document'))
      return 'word'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return 'excel'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
      return 'powerpoint'
    if (mimeType.includes('image')) return 'img'
    return 'file'
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
      <TrashDocumentViewer
        // recentlyAccessed={documentsData.recentlyAccessed}
        allFiles={transformedDocuments}
        apiClient={apiClient}
        transformApiResponse={transformApiResponse}
      />
    </div>
  )
}

export default TrashPage