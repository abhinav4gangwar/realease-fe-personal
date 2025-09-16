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

interface MiniMapProps {
  coordinates?: string
  propertyName?: string
  onClick: () => void
}

const MiniMap = ({ coordinates, onClick }: MiniMapProps) => {
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
        <Marker position={[coords.lat, coords.lng]} />
      </MapContainer>

      <div className="bg-opacity-0 group-hover:bg-opacity-10 absolute inset-0 flex items-center justify-center bg-black transition-all duration-200">
        <div className="bg-opacity-90 rounded-full bg-white px-3 py-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Click to expand
        </div>
      </div>
    </div>
  )
}

export default MiniMap
