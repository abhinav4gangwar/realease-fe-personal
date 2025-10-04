'use client'

import { Properties } from '@/types/property.types'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { toast } from 'sonner'
import { propertiesApi } from '../properties/_property_utils/property.services'
import { apiClient } from '@/utils/api'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import MapPropertiesSidebar from './_components/map-sidebar'

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
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
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

interface KmlShape {
  name: string;
  type: 'Polygon' | 'LineString' | 'Point';
  coordinates: any; // e.g., [[lat, lng], ...] for Polyline, or [[[lat, lng], ...]] for Polygon
}

// MapController component to handle map navigation
function MapController({ 
  center, 
  zoom 
}: { 
  center: [number, number] | null
  zoom: number 
}) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])
  
  return null
}

const MapPage = () => {
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState<Properties[]>([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5726, 88.3639]) // Default to Kolkata
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(null)
  const [flyToCoordinates, setFlyToCoordinates] = useState<[number, number] | null>(null)
  const [kmlLayers, setKmlLayers] = useState<KmlShape[]>([])
  const [isLoadingKml, setIsLoadingKml] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchProperties()
  }, [])

  // Create a stable dependency from all properties' KML files
  const allKmlFileIds = useMemo(() => {
    const allKmlFiles = properties.flatMap(property =>
      property.documents?.filter(doc =>
        doc.name.toLowerCase().endsWith('.kml') || doc.fileType?.includes('kml')
      ) || []
    )
    return allKmlFiles.map(doc => doc.doc_id).join(',')
  }, [properties])

  // KML extraction function
  const extractKmlShapes = useCallback((kmlDoc: Document): KmlShape[] => {
    const shapes: KmlShape[] = []
    const placemarks = kmlDoc.querySelectorAll('Placemark')

    placemarks.forEach(placemark => {
      const name = placemark.querySelector('name')?.textContent || 'Unnamed Shape'

      const processCoordinates = (coordString: string | null | undefined): [number, number][] => {
        if (!coordString) return []
        const points: [number, number][] = []
        const coordPairs = coordString.trim().split(/[\s\n\r]+/).filter(Boolean)

        coordPairs.forEach(pair => {
          const coords = pair.split(',').map(c => parseFloat(c.trim())).filter(n => !isNaN(n))
          if (coords.length >= 2) {
            points.push([coords[1], coords[0]]) // Leaflet uses [lat, lng]
          }
        })

        return points
      }

      // Check for Polygon
      const polygon = placemark.querySelector('Polygon LinearRing coordinates')
      if (polygon) {
        const coordinates = processCoordinates(polygon.textContent)
        if (coordinates.length >= 3) {
          shapes.push({
            name,
            type: 'Polygon',
            coordinates: [coordinates] // Polygon expects array of coordinate arrays
          })
          return
        }
      }

      // Check for LineString
      const lineString = placemark.querySelector('LineString coordinates')
      if (lineString) {
        const coordinates = processCoordinates(lineString.textContent)
        if (coordinates.length >= 2) {
          shapes.push({
            name,
            type: 'LineString',
            coordinates
          })
          return
        }
      }

      // Check for Point
      const point = placemark.querySelector('Point coordinates')
      if (point) {
        const coordinates = processCoordinates(point.textContent)
        if (coordinates.length >= 1) {
          shapes.push({
            name,
            type: 'Point',
            coordinates: coordinates[0]
          })
          return
        }
      }
    })

    return shapes
  }, [])

  // Load KML files from all properties
  const loadKmlFiles = useCallback(async () => {
    if (!properties.length) return

    const allKmlFiles = properties.flatMap(property =>
      property.documents?.filter(doc =>
        doc.name.toLowerCase().endsWith('.kml') || doc.fileType?.includes('kml')
      ) || []
    )

    if (allKmlFiles.length === 0) return

    setIsLoadingKml(true)
    const allShapes: KmlShape[] = []

    for (const kmlFile of allKmlFiles) {
      try {
        const response = await apiClient.post('/dashboard/documents/download', {
          items: [{ id: kmlFile.doc_id, type: "file" }]
        }, { responseType: 'text' })

        if (response.data) {
          const parser = new DOMParser()
          const kmlDoc = parser.parseFromString(response.data, 'text/xml')
          const shapes = extractKmlShapes(kmlDoc)
          if (shapes.length > 0) {
            allShapes.push(...shapes)
            console.log(`✅ Loaded ${shapes.length} shapes from KML file: ${kmlFile.name}`)
          } else {
            console.warn(`⚠️ No shapes found in KML file: ${kmlFile.name}`)
          }
        }
      } catch (error) {
        console.error(`❌ Error loading KML file ${kmlFile.name}:`, error)
      }
    }

    setKmlLayers(allShapes)
    setIsLoadingKml(false)
  }, [properties, extractKmlShapes])

  // Load KML files when properties change
  useEffect(() => {
    if (allKmlFileIds) {
      loadKmlFiles()
    } else {
      setKmlLayers([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allKmlFileIds])

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

  const handlePropertyClick = (property: Properties) => {
    setSelectedProperty(property)

    // Navigate to property location on map
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
    <div className="relative h-screen w-full">
      {/* Toggle Sidebar Button */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute right-4 top-4 z-[999] bg-white text-primary shadow-lg transition-all hover:bg-primary hover:text-white`}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Map Container */}
      <div className="h-full w-full relative">
        {/* KML Loading Indicator */}
        {isLoadingKml && (
          <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-700">Loading KML files...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          {/* Map Controller for navigation */}
          <MapController center={flyToCoordinates} zoom={16} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {validProperties.map((property) => {
            const lat = parseFloat(property.latitude || '0')
            const lng = parseFloat(property.longitude || '0')

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
                      <p><strong>Value:</strong> ₹ {parseInt(property.value || '0').toLocaleString()}</p>
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

          {/* KML Layers */}
          {kmlLayers.map((shape, index) => {
            const color = '#42d4f4' // Use a consistent color for all KML shapes

            if (shape.type === 'Polygon' && shape.coordinates) {
              return (
                <Polygon key={`kml-${index}`} positions={shape.coordinates} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.4 }}>
                  <Popup>{shape.name}</Popup>
                </Polygon>
              )
            }

            if (shape.type === 'LineString' && shape.coordinates) {
              return (
                <Polyline key={`kml-${index}`} positions={shape.coordinates} pathOptions={{ color: color }}>
                   <Popup>{shape.name}</Popup>
                </Polyline>
              )
            }

            if (shape.type === 'Point' && shape.coordinates) {
                return (
                    <Marker key={`kml-${index}`} position={shape.coordinates}>
                        <Popup>{shape.name}</Popup>
                    </Marker>
                )
            }

            return null;
          })}
        </MapContainer>
      </div>

      {/* Properties Sidebar */}
      <MapPropertiesSidebar
        properties={validProperties}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onPropertyClick={handlePropertyClick}
      />
    </div>
  )
}

export default MapPage