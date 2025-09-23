'use client'
import { usePropertySearchContext } from '@/providers/property-search-context'
import { apiClient } from '@/utils/api'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import PropertiesViewer from './_components/properties-viewer'
import MobilePropertiesViewer from './_mobile-properties-components/mobile-properties-viewer'

const Propertiespage = () => {
  const [fetchedProperties, setFetchedProperties] = useState([])
  const { searchResults, searchQuery, isSearchActive, clearSearchResults } =
    usePropertySearchContext()

  const fetchProperties = useCallback(async () => {
    try {
      const response = await apiClient.get('/dashboard/properties/list')
      setFetchedProperties(response.data.allProperties)
    } catch (error) {
      toast.error(error as string)
      console.error('Error fetching properties:', error)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handlePropertyCreated = useCallback(() => {
    fetchProperties()
  }, [fetchProperties])

  const getPropertiesToShow = () => {
    if(isSearchActive && searchResults) {
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
      {isSearchActive && searchResults && (
        <div className="lg:mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 mt-20 lg:mt-0">
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
        <PropertiesViewer
          allProperties={propertiesToShow}
          onPropertyCreated={handlePropertyCreated}
        />
      </div>

      {/* for mobile */}
      <div className={`block ${ searchResults ? ("pt-4") : ("pt-14")} lg:hidden`}>
        <MobilePropertiesViewer allProperties={propertiesToShow} />
      </div>
    </div>
  )
}

export default Propertiespage
