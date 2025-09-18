'use client'
import { Document } from '@/types/document.types'
import { createContext, useContext, useState } from 'react'

export interface SearchResults {
  query: string
  totalResults: number
  documents: Document[]
  groupedResults: {
    byType: Record<string, Document[]>
    byMimeType: Record<string, Document[]>
  }
  searchStats: {
    totalFound: number
    appliedFilters: {
      type: string | null
      parentId: string | null
      propertyId: string | null
      mimeType: string | null
      tags: string | null
    }
  }
}

interface SearchContextType {
  searchResults: SearchResults | null
  searchQuery: string
  isSearchActive: boolean
  setSearchResults: (results: SearchResults) => void
  setSearchQuery: (query: string) => void
  clearSearchResults: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResultsState] = useState<SearchResults | null>(
    null
  )
  const [searchQuery, setSearchQueryState] = useState<string>('')
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false)

  const setSearchResults = (results: SearchResults) => {
    setSearchResultsState(results)
    setIsSearchActive(true)
  }

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query)
  }

  const clearSearchResults = () => {
    setSearchResultsState(null)
    setSearchQueryState('')
    setIsSearchActive(false)
  }

  const getTransformedSearchDocuments = () => {
    if (!searchResults || !searchResults.documents) return []

    // Helper function to get file type icon from mime type
    const getFileTypeFromMimeType = (mimeType, fileName) => {
      if (!mimeType) return 'file'

      // Simple mapping for common types
      if (mimeType.includes('pdf')) return 'pdf'
      if (mimeType.includes('word') || mimeType.includes('document'))
        return 'word'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
        return 'excel'
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
        return 'powerpoint'
      if (mimeType.includes('image')) return 'img'
      if (mimeType.includes('text')) return 'txt'
      if (mimeType.includes('json')) return 'json'
      if (mimeType.includes('html')) return 'html'
      if (mimeType.includes('css')) return 'css'
      if (mimeType.includes('javascript')) return 'js'

      return 'file'
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

    const transformed = searchResults.documents.map((doc) => {
      console.log('Transforming search document:', doc)

      return {
        id: doc.id?.toString() || '',
        name: doc.name || 'Untitled',
        icon:
          doc.type === 'folder'
            ? 'folder'
            : doc.icon || getFileTypeFromMimeType(doc.mimeType, doc.name),
        linkedProperty: doc.linkedProperty?.name,
        dateAdded: formatDate(doc.createdAt || doc.modifiedOn),
        dateModified: formatDate(doc.modifiedOn || doc.createdAt),
        lastOpened: formatDate(doc.modifiedOn || doc.createdAt),
        fileType: doc.mimeType || 'Unknown',
        tags: Array.isArray(doc.tags)
          ? doc.tags.join(', ')
          : doc.tags
            ? String(doc.tags)
            : '',
        isFolder: doc.type === 'folder',
        hasChildren: doc.hasChildren || false,
        children: [],
        size: doc.size || null,
        s3Key: doc.s3Key || null,
        parentId: doc.parentId || null,
      }
    })

    console.log('Transformed search documents:', transformed)
    return transformed
  }

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchQuery,
        isSearchActive,
        setSearchResults,
        setSearchQuery,
        clearSearchResults,
        getTransformedSearchDocuments,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
