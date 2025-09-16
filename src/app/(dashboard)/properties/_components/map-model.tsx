'use client'
import { Button } from '@/components/ui/button'
import { parseCoordinates } from '@/utils/coordinateParser'
import { getPropertyMarkerIcon } from '@/utils/customMarker'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

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

interface FullMapModalProps {
  isOpen: boolean
  onClose: () => void
  coordinates?: string
  propertyName?: string
  propertyAddress?: string
  propertyType?: string
  isDisputed?: boolean
}

const FullMapModal = ({ 
  isOpen, 
  onClose, 
  coordinates, 
  propertyName,
  propertyAddress,
  propertyType,
  isDisputed
}: FullMapModalProps) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const coords = coordinates ? parseCoordinates(coordinates) : { lat: 0, lng: 0 }

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Property Location</h2>
            {propertyName && (
              <p className="text-gray-600 text-sm">{propertyName}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Content */}
        <div className="flex-1 relative">
          {isClient && coordinates && coords.lat !== 0 && coords.lng !== 0 ? (
            <MapContainer
              center={[coords.lat, coords.lng]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker 
                position={[coords.lat, coords.lng]}
                icon={getPropertyMarkerIcon(true, false, isDisputed, propertyType)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{propertyName || 'Property'}</h3>
                    {propertyAddress && (
                      <p className="text-sm text-gray-600 mt-1">{propertyAddress}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600">Unable to display map</p>
                <p className="text-gray-500 text-sm mt-1">
                  {!coordinates ? 'No coordinates available' : 'Invalid coordinates format'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {coordinates && (
                <span>Coordinates: {coordinates}</span>
              )}
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullMapModal