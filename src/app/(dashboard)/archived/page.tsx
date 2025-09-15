'use client'
import { apiClient } from '@/utils/api'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import ArchivedPropertiesViewer from './_components/archived-properties-viewer'

const ArchivedPage = () => {
  const [fetchedProperties, setFetchedProperties] = useState([])
  const fetchProperties = useCallback(async () => {
    try {
      const response = await apiClient.get('/dashboard/properties/archived')
      setFetchedProperties(response.data.archivedProperties)
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

  return (
    <div>
      <ArchivedPropertiesViewer
        allProperties={fetchedProperties}
        onPropertyCreated={handlePropertyCreated}
      />
    </div>
  )
}

export default ArchivedPage
