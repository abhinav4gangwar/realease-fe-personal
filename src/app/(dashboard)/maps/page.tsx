'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { Properties } from '@/types/property.types'
import { toast } from 'sonner'
import { propertiesApi } from '../properties/_property_utils/property.services'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

const MapPage = () => {
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState<Properties[]>([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([]) 

  useEffect(() => {
    setIsClient(true)
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesApi.getProperties()
      setProperties(data)
      
      // Calculate center based on first valid property coordinates
      if (data.length > 0) {
        const firstProperty = data[0]
        if (firstProperty.latitude && firstProperty.longitude) {
          const lat = parseFloat(firstProperty.latitude)
          const lng = parseFloat(firstProperty.longitude)
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter([lat, lng])
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load properties')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <span className="text-gray-600">Loading properties...</span>
        </div>
      </div>
    )
  }

  const validProperties = properties.filter(property => {
    if (!property.latitude || !property.longitude) return false
    const lat = parseFloat(property.latitude)
    const lng = parseFloat(property.longitude)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validProperties.map((property) => {
          const lat = parseFloat(property.latitude)
          const lng = parseFloat(property.longitude)
          
          return (
            <Marker
              key={property.id}
              position={[lat, lng]}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  <h3 className="font-bold text-lg mb-2">{property.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Type:</strong> {property.type}</p>
                    <p><strong>Owner:</strong> {property.owner}</p>
                    <p><strong>Location:</strong> {property.location}</p>
                    <p><strong>Extent:</strong> {property.extent}</p>
                    <p><strong>Value:</strong> ${parseInt(property.value).toLocaleString()}</p>
                    {property.isDisputed && (
                      <p className="text-primary font-semibold">
                        ⚠️ Disputed - {property.legalStatus}
                      </p>
                    )}
                    {property.address && (
                      <p className="text-gray-600 mt-2 pt-2 border-t">
                        {property.address}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
    </div>
  )
}

export default MapPage