'use client'

import { apiClient } from '@/utils/api'
import { getFileTypeFromMime } from '@/utils/fileTypeUtils'

import { useSearchContext } from '@/providers/doc-search-context'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DocumentViewer } from './_components/document-viewer'

const Documentspage = () => {
  const [fetchedDocuments, setFetchedDocuments] = useState(null)
  const {
    searchResults,
    searchQuery,
    isSearchActive,
    clearSearchResults,
    getTransformedSearchDocuments,
  } = useSearchContext()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/dashboard/documents/list')
        setFetchedDocuments(response.data)
        console.log('📁 Fetched all documents:', response.data)
      } catch (error) {
        console.error('❌ Error fetching documents:', error)
      }
    }

    fetchDocuments()
  }, [])

  // Transform API response to match component expectations
  const transformApiResponse = (apiData) => {
    if (!apiData || !apiData.children) return []
    return apiData.children.map((item) => ({
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

  const getFileTypeFromMimeType = (mimeType, fileName) => {
    if (!mimeType) return 'file'
    const friendlyType = getFileTypeFromMime(mimeType, fileName)
    const iconTypeMap = {
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

    return iconTypeMap[friendlyType] || friendlyType?.toLowerCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDocumentsToShow = () => {
    if (isSearchActive && searchResults) {
      return getTransformedSearchDocuments()
    } else {
      return transformApiResponse(fetchedDocuments)
    }
  }

  const documentsToShow = getDocumentsToShow()

  const handleClearSearch = () => {
    clearSearchResults()
  }

  return (
    <div>
      {/* Search Results Banner */}
      {isSearchActive && searchResults && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-blue-900">
              Search Results for {searchQuery}
            </div>
            <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
              {searchResults.totalResults} results found
            </div>
          </div>
          <button
            onClick={handleClearSearch}
            className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            <X className="h-4 w-4" />
            Clear Search
          </button>
        </div>
      )}

      {/* for desktop */}
      <div className="hidden lg:block">
        <DocumentViewer
          allFiles={documentsToShow}
          apiClient={apiClient}
          transformApiResponse={transformApiResponse}
        />
      </div>

      {/* for mobile */}
      {/* <div className="block pt-14 lg:hidden">
        <MobileDocumentViewer
          allFiles={documentsToShow}
          apiClient={apiClient}
          transformApiResponse={transformApiResponse}
        />
      </div> */}
    </div>
  )
}

export default Documentspage
