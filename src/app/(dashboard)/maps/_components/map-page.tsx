'use client'

import { Properties } from '@/types/property.types'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMap } from 'react-leaflet'
import { toast } from 'sonner'

import { apiClient } from '@/utils/api'
import { propertiesApi } from '../../properties/_property_utils/property.services'
import { LayerSelector, LayerType, getLayerConfig } from './layer-selector'
import MapPropertiesSidebar from './map-sidebar'

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
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

if (typeof window !== 'undefined') {
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
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

function MapController({
  center,
  zoom,
}: {
  center: [number, number] | null
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 })
    }
  }, [center, zoom, map])
  return null
}

const MapPage = () => {
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState<Properties[]>([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    22.5726, 88.3639,
  ])
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(
    null
  )
  const [flyToCoordinates, setFlyToCoordinates] = useState<
    [number, number] | null
  >(null)
  const [kmlLayers, setKmlLayers] = useState<KmlShape[]>([])
  const [isLoadingKml, setIsLoadingKml] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('normal')

  useEffect(() => {
    setIsClient(true)
    fetchProperties()
  }, [])

  const allKmlFileIds = useMemo(() => {
    const ids = properties
      .flatMap(
        (p) =>
          p.documents?.filter(
            (d) =>
              d.name.toLowerCase().endsWith('.kml') ||
              d.fileType?.includes('kml')
          ) ?? []
      )
      .map((d) => d.doc_id)
      .join(',')
    return ids
  }, [properties])

  const extractKmlShapes = useCallback((kmlDoc: Document): KmlShape[] => {
    const shapes: KmlShape[] = []
    const placemarks = kmlDoc.querySelectorAll('Placemark')

    placemarks.forEach((placemark) => {
      const name =
        placemark.querySelector('name')?.textContent || 'Unnamed Shape'

      const processCoordinates = (
        coordStr: string | null | undefined
      ): [number, number][] => {
        if (!coordStr) return []
        return coordStr
          .trim()
          .split(/[\s\n\r]+/)
          .filter(Boolean)
          .map((pair) => {
            const [lng, lat] = pair.split(',').map(parseFloat)
            return isNaN(lat) || isNaN(lng)
              ? null
              : ([lat, lng] as [number, number])
          })
          .filter(Boolean) as [number, number][]
      }

      // Polygon
      const polyCoords = placemark.querySelector(
        'Polygon LinearRing coordinates'
      )
      if (polyCoords) {
        const coords = processCoordinates(polyCoords.textContent)
        if (coords.length >= 3) {
          shapes.push({ name, type: 'Polygon', coordinates: [coords] })
          return
        }
      }

      // LineString
      const lineCoords = placemark.querySelector('LineString coordinates')
      if (lineCoords) {
        const coords = processCoordinates(lineCoords.textContent)
        if (coords.length >= 2) {
          shapes.push({ name, type: 'LineString', coordinates: coords })
          return
        }
      }

      // Point
      const pointCoords = placemark.querySelector('Point coordinates')
      if (pointCoords) {
        const coords = processCoordinates(pointCoords.textContent)
        if (coords.length) {
          shapes.push({ name, type: 'Point', coordinates: coords[0] })
        }
      }
    })
    return shapes
  }, [])

  const loadKmlFiles = useCallback(async () => {
    if (!properties.length) return
    const kmlFiles = properties.flatMap(
      (p) =>
        p.documents?.filter(
          (d) =>
            d.name.toLowerCase().endsWith('.kml') || d.fileType?.includes('kml')
        ) ?? []
    )
    if (!kmlFiles.length) return

    setIsLoadingKml(true)
    const allShapes: KmlShape[] = []

    for (const file of kmlFiles) {
      try {
        const { data } = await apiClient.post(
          '/dashboard/documents/download',
          { items: [{ id: file.doc_id, type: 'file' }] },
          { responseType: 'text' }
        )
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/xml')
        const shapes = extractKmlShapes(doc)
        allShapes.push(...shapes)
      } catch (e) {
        console.error(`KML load error (${file.name}):`, e)
      }
    }

    setKmlLayers(allShapes)
    setIsLoadingKml(false)
  }, [properties, extractKmlShapes])

  useEffect(() => {
    if (allKmlFileIds) loadKmlFiles()
    else setKmlLayers([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allKmlFileIds])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesApi.getProperties()
      setProperties(data)

      const first = data[0]
      if (first?.latitude && first?.longitude) {
        const lat = parseFloat(first.latitude)
        const lng = parseFloat(first.longitude)
        if (!isNaN(lat) && !isNaN(lng)) setMapCenter([lat, lng])
      }
    } catch (err) {
      toast.error('Failed to load properties')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property: Properties) => {
    setSelectedProperty(property)
    const lat = parseFloat(property.latitude || '0')
    const lng = parseFloat(property.longitude || '0')
    if (!isNaN(lat) && !isNaN(lng)) {
      setFlyToCoordinates([lat, lng])
    } else {
      toast.error('Invalid coordinates for this property')
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-gray-100">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <span className="text-gray-600">Loading properties...</span>
        </div>
      </div>
    )
  }

  const validProperties = properties.filter((p) => {
    const lat = parseFloat(p.latitude || '')
    const lng = parseFloat(p.longitude || '')
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <section className="relative flex-[0_0_70%] overflow-hidden bg-white">
        {isLoadingKml && (
          <div className="absolute top-4 left-4 z-10 rounded-lg bg-white px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              <span className="text-sm text-gray-700">
                Loading KML files...
              </span>
            </div>
          </div>
        )}

        {/* Layer Selector - positioned below zoom controls */}
       
          <LayerSelector
            selectedLayer={selectedLayer}
            onLayerChange={setSelectedLayer}
            className="top-20 left-4"
          />


        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={flyToCoordinates} zoom={16} />
          <TileLayer
            key={selectedLayer} // Force re-render when layer changes
            attribution={getLayerConfig(selectedLayer).attribution}
            url={getLayerConfig(selectedLayer).url}
          />

          {/* Property markers */}
          {validProperties.map((p) => {
            const lat = parseFloat(p.latitude!)
            const lng = parseFloat(p.longitude!)
            return (
              <Marker key={p.id} position={[lat, lng]}>
                <Popup>
                  <div className="min-w-[200px] p-2">
                    <h3 className="mb-2 text-lg font-bold">{p.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Type:</strong> {p.type}
                      </p>
                      <p>
                        <strong>Owner:</strong> {p.owner}
                      </p>
                      <p>
                        <strong>Location:</strong> {p.location}
                      </p>
                      <p>
                        <strong>Extent:</strong> {p.extent}
                      </p>
                      <p>
                        <strong>Value:</strong> ₹{' '}
                        {parseInt(p.value || '0').toLocaleString()}
                      </p>
                      {p.isDisputed && (
                        <p className="text-primary font-semibold">
                          Disputed – {p.legalStatus}
                        </p>
                      )}
                      {p.address && (
                        <p className="mt-2 border-t pt-2 text-gray-600">
                          {p.address}
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* KML shapes */}
          {kmlLayers.map((shape, idx) => {
            const color = '#42d4f4'
            if (shape.type === 'Polygon' && shape.coordinates) {
              return (
                <Polygon
                  key={`kml-poly-${idx}`}
                  positions={shape.coordinates}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.4 }}
                >
                  <Popup>{shape.name}</Popup>
                </Polygon>
              )
            }
            if (shape.type === 'LineString' && shape.coordinates) {
              return (
                <Polyline
                  key={`kml-line-${idx}`}
                  positions={shape.coordinates}
                  pathOptions={{ color }}
                >
                  <Popup>{shape.name}</Popup>
                </Polyline>
              )
            }
            if (shape.type === 'Point' && shape.coordinates) {
              return (
                <Marker key={`kml-point-${idx}`} position={shape.coordinates}>
                  <Popup>{shape.name}</Popup>
                </Marker>
              )
            }
            return null
          })}
        </MapContainer>
      </section>

      <aside className="flex flex-[0_0_30%] flex-col overflow-hidden border-l border-gray-200 bg-white">
        <MapPropertiesSidebar
          properties={validProperties}
          isOpen={true}
          onClose={() => {}}
          onPropertyClick={handlePropertyClick}
        />
      </aside>
    </div>
  )
}

export default MapPage
