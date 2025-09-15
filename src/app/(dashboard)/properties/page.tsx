'use client'
import { apiClient } from '@/utils/api'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import PropertiesViewer from './_components/properties-viewer'
import MobilePropertiesViewer from './_mobile-properties-components/mobile-properties-viewer'

const Propertiespage = () => {
  const [fetchedProperties, setFetchedProperties] = useState([])

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

  return (
    <div>
      {/* for desktop */}
      <div className="hidden lg:block">
        <PropertiesViewer 
          allProperties={fetchedProperties} 
          onPropertyCreated={handlePropertyCreated}
        />
      </div>

      {/* for mobile */}
      <div className="block pt-14 lg:hidden">
        <MobilePropertiesViewer allProperties={fetchedProperties} />
      </div>
    </div>
  )
}

export default Propertiespage
