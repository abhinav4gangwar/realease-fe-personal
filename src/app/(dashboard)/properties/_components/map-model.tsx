'use client'
import { Button } from '@/components/ui/button'
import { parseCoordinates } from '@/utils/coordinateParser'
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
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

interface FullMapModalProps {
  isOpen: boolean
  onClose: () => void
  coordinates?: string
  propertyName?: string
  propertyAddress?: string
}

const FullMapModal = ({
  isOpen,
  onClose,
  coordinates,
  propertyName,
  propertyAddress,
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

  const coords = coordinates
    ? parseCoordinates(coordinates)
    : { lat: 0, lng: 0 }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[60] flex items-center justify-center bg-black p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-semibold">Property Location</h2>
            {propertyName && (
              <p className="text-sm text-gray-600">{propertyName}</p>
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
        <div className="relative flex-1">
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
              <Marker position={[coords.lat, coords.lng]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">
                      {propertyName || 'Property'}
                    </h3>
                    {propertyAddress && (
                      <p className="mt-1 text-sm text-gray-600">
                        {propertyAddress}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Coordinates: {coords.lat.toFixed(6)},{' '}
                      {coords.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600">Unable to display map</p>
                <p className="mt-1 text-sm text-gray-500">
                  {!coordinates
                    ? 'No coordinates available'
                    : 'Invalid coordinates format'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {coordinates && <span>Coordinates: {coordinates}</span>}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullMapModal
