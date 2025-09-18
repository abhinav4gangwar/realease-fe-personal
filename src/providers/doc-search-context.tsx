"use client"
import { Document } from '@/types/document.types'
import { createContext, useContext, useState } from 'react'

export interface DocSearchResults {
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

interface DocSearchContextType {
  searchResults: DocSearchResults | null
  searchQuery: string
  isSearchActive: boolean
  setSearchResults: (results: DocSearchResults) => void
  setSearchQuery: (query: string) => void
  clearSearchResults: () => void
}

const SearchContext = createContext<DocSearchContextType | undefined>(undefined)

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResultsState] =
    useState<DocSearchResults | null>(null)
  const [searchQuery, setSearchQueryState] = useState<string>('')
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false)

  const setSearchResults = (results: DocSearchResults) => {
    console.log('🔍 Search Results Set:', results)
    console.log('📊 Total Results:', results.totalResults)
    console.log('📁 Documents Found:', results.documents)
    console.log('🏷️ Grouped Results:', results.groupedResults)
    console.log('📈 Search Stats:', results.searchStats)

    setSearchResultsState(results)
    setIsSearchActive(true)
  }

  const setSearchQuery = (query: string) => {
    console.log('🔍 Search Query Set:', query)
    setSearchQueryState(query)
  }

  const clearSearchResults = () => {
    console.log('🗑️ Search Results Cleared')
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
