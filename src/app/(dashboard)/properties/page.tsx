'use client'

import { usePropertySearchContext } from '@/providers/property-search-context'
import { apiClient } from '@/utils/api'
import { Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import PropertiesViewer from './_components/properties-viewer'
import MobilePropertiesViewer from './_mobile-properties-components/mobile-properties-viewer'

const Propertiespage = () => {
  const [fetchedProperties, setFetchedProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { searchResults, searchQuery, isSearchActive, clearSearchResults } =
    usePropertySearchContext()

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/dashboard/properties/list')
      setFetchedProperties(response.data.allProperties)
    } catch (error) {
      toast.error('Failed to fetch properties')
      console.error('Error fetching properties:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handlePropertyCreated = useCallback(() => {
    fetchProperties()
  }, [fetchProperties])

  const getPropertiesToShow = () => {
    if (isSearchActive && searchResults) {
      return searchResults.allProperties
    } else {
      return fetchedProperties
    }
  }

  const propertiesToShow = getPropertiesToShow()

  const handleClearSearch = () => {
    clearSearchResults()
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Loading your properties...</span>
          </div>
        </div>
      ) : (
        <>
          {isSearchActive && searchResults && (
            <div className="mt-20 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 lg:mt-0 lg:mb-4">
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

          {/* Desktop */}
          <div className="hidden lg:block">
            <PropertiesViewer
              allProperties={propertiesToShow}
              onPropertyCreated={handlePropertyCreated}
            />
          </div>

          {/* Mobile */}
          <div className={`block ${searchResults ? 'pt-4' : 'pt-14'} lg:hidden`}>
            <MobilePropertiesViewer allProperties={propertiesToShow} />
          </div>
        </>
      )}
    </div>
  )
}

export default Propertiespage
