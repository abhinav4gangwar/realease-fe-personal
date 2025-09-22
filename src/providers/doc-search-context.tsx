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

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        searchQuery,
        isSearchActive,
        setSearchResults,
        setSearchQuery,
        clearSearchResults,
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
