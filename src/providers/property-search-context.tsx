'use client'

import { Properties } from '@/types/property.types'
import { createContext, useContext, useState } from 'react'

export interface PropertySearchResults {
  query: string
  totalResults: number
  allProperties: Properties[]
  searchStats: {
    totalFound: number
    appliedFilters: {
      type: string | null
      owner: string | null
      location: string | null
      legalStatus: string | null
      isDisputed: string | null
    }
  }
}

interface SearchContextType {
  searchResults: PropertySearchResults | null
  searchQuery: string
  isSearchActive: boolean
  setSearchResults: (results: PropertySearchResults) => void
  setSearchQuery: (query: string) => void
  clearSearchResults: () => void
}

const PropertySearchContext = createContext<SearchContextType | undefined>(
  undefined
)

export const PropertySearchProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const [searchResults, setSearchResultsState] =
    useState<PropertySearchResults | null>(null)
  const [searchQuery, setSearchQueryState] = useState<string>('')
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false)

  const setSearchResults = (results: PropertySearchResults) => {
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
    <PropertySearchContext.Provider
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
    </PropertySearchContext.Provider>
  )
}

export const usePropertySearchContext = () => {
  const context = useContext(PropertySearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
