'use client'
import { parseCoordinates } from '@/utils/coordinateParser'
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

interface MiniMapProps {
  coordinates?: string
  propertyName?: string
  propertyType?: string
  isDisputed?: boolean
  onClick?: () => void
}

const MiniMap = ({
  coordinates,
  propertyType,
  isDisputed,
  onClick,
}: MiniMapProps) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !coordinates) {
    return (
      <div
        className="flex h-full w-full cursor-pointer items-center justify-center rounded bg-gray-200"
        onClick={onClick}
      >
        <span className="text-gray-500">Click to view map</span>
      </div>
    )
  }

  const coords = parseCoordinates(coordinates)

  if (coords.lat === 0 && coords.lng === 0) {
    return (
      <div
        className="flex h-full w-full cursor-pointer items-center justify-center rounded bg-gray-200"
        onClick={onClick}
      >
        <span className="text-gray-500">Invalid coordinates</span>
      </div>
    )
  }

  return (
    <div
      className="group relative h-full w-full cursor-pointer overflow-hidden rounded"
      onClick={onClick}
    >
      
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[coords.lat, coords.lng]}
        />
      </MapContainer>
    </div>
  )
}

export default MiniMap
