'use client'

import { apiClient } from '@/utils/api'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ArchivedPropertiesViewer from './_components/archived-properties-viewer'

const ArchivedPage = () => {
  const [fetchedProperties, setFetchedProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/dashboard/properties/archived')
      setFetchedProperties(response.data.archivedProperties)
    } catch (error) {
      toast.error('Failed to fetch archived properties')
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

  return (
    <div>
      {isLoading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Loading archived properties...</span>
          </div>
        </div>
      ) : (
        <ArchivedPropertiesViewer
          allProperties={fetchedProperties}
          onPropertyCreated={handlePropertyCreated}
        />
      )}
    </div>
  )
}

export default ArchivedPage
