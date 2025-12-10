'use client'

import dynamic from 'next/dynamic'

import { toast } from 'sonner'

import { propertiesApi } from '@/app/(dashboard)/properties/_property_utils/property.services'

import {
  getLayerConfig,
  LayerSelector,
  LayerType,
} from '@/app/(dashboard)/maps/_components/layer-selector'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
})
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), {
  ssr: false,
})
const Polygon = dynamic(() => import('react-leaflet').then((m) => m.Polygon), {
  ssr: false,
})
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
)

if (typeof window !== 'undefined') {
  const L = require('leaflet')
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface KmlShape {
  name: string
  type: 'Polygon' | 'LineString' | 'Point'
  coordinates: any
}

function FlyController({ center, zoom }: { center: any; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 })
  }, [center])
  return null
}

export const MapView = ({
  height = '400px',
  zoom = 12,
}: {
  height?: string
  zoom?: number
}) => {
  const [loaded, setLoaded] = useState(false)
  const [properties, setProperties] = useState([])
  const [kmlLayers, setKmlLayers] = useState<KmlShape[]>([])
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('minimal')

  const [center, setCenter] = useState<[number, number] | null>(null)

  useEffect(() => {
    setLoaded(true)
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.getProperties()
      setProperties(data)
      if (data[0]?.latitude && data[0]?.longitude) {
        setCenter([parseFloat(data[0].latitude), parseFloat(data[0].longitude)])
      }
    } catch (e) {
      toast.error('Failed to load properties')
    }
  }

  const validProps = properties.filter((p: any) => {
    const lat = parseFloat(p.latitude)
    const lng = parseFloat(p.longitude)
    return !isNaN(lat) && !isNaN(lng)
  })

  if (!loaded || !center)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading map…
      </div>
    )

  return (
    <div className="relative" style={{ height }}>
      <LayerSelector
        selectedLayer={selectedLayer}
        onLayerChange={setSelectedLayer}
        className="top-3 left-3 z-[5000]"
      />

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <FlyController center={center} zoom={zoom} />

        <TileLayer
          key={selectedLayer}
          attribution={getLayerConfig(selectedLayer).attribution}
          url={getLayerConfig(selectedLayer).url}
        />

        {validProps.map((p: any) => (
          <Marker
            key={p.id}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          >
            <Popup>{p.name}</Popup>
          </Marker>
        ))}

        {kmlLayers.map((shape, i) => {
          const color = '#42d4f4'
          if (shape.type === 'Polygon') {
            return (
              <Polygon
                key={i}
                positions={shape.coordinates}
                pathOptions={{ color, fillOpacity: 0.4 }}
              />
            )
          }
          if (shape.type === 'LineString') {
            return (
              <Polyline
                key={i}
                positions={shape.coordinates}
                pathOptions={{ color }}
              />
            )
          }
          if (shape.type === 'Point') {
            return <Marker key={i} position={shape.coordinates} />
          }
        })}
      </MapContainer>
    </div>
  )
}
