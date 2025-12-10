'use client'
import { Button } from '@/components/ui/button'
import { parseCoordinates } from '@/utils/coordinateParser'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { apiClient } from '@/utils/api'

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false })


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

interface FullMapModalProps {
  isOpen: boolean
  onClose: () => void
  coordinates?: string
  propertyName?: string
  propertyAddress?: string
  propertyType?: string
  isDisputed?: boolean
  documents?: Array<{
    doc_id: number
    name: string
    icon: string
    fileType: string
    size: number
  }>
}

const FullMapModal = ({
  isOpen,
  onClose,
  coordinates,
  propertyName,
  propertyAddress,
  documents = []
}: FullMapModalProps) => {
  const [isClient, setIsClient] = useState(false)
  const [kmlLayers, setKmlLayers] = useState<KmlShape[]>([])
  const [isLoadingKml, setIsLoadingKml] = useState(false)

  // ✅ Create a stable dependency from the documents prop.
  // This string will only change when the list of KML doc IDs actually changes.
  const kmlFileIds = useMemo(() =>
    documents
      ?.filter(doc => doc.name.toLowerCase().endsWith('.kml') || doc.fileType.includes('kml'))
      .map(doc => doc.doc_id)
      .join(',') ?? ''
  , [documents])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // --- ✨ NEW AND IMPROVED PARSING LOGIC ---
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

  const loadKmlFiles = useCallback(async () => {
    if (!documents) return
    const kmlFiles = documents.filter(doc => doc.name.toLowerCase().endsWith('.kml') || doc.fileType.includes('kml'))
    if (kmlFiles.length === 0) return

    setIsLoadingKml(true)
    const allShapes: KmlShape[] = []

    for (const kmlFile of kmlFiles) {
      try {
        const response = await apiClient.post('/dashboard/documents/download', {
          items: [{ id: kmlFile.doc_id, type: "file" }]
        }, { responseType: 'text' })

        if (response.data) {
          const parser = new DOMParser()
          const kmlDoc = parser.parseFromString(response.data, 'text/xml')
          // Use the new, structured parsing function
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
  }, [documents, extractKmlShapes])

  // ✅ Use the stable `kmlFileIds` string to trigger the effect.
  useEffect(() => {
    if (isOpen && kmlFileIds) {
      loadKmlFiles()
    } else {
      setKmlLayers([]) // Clear layers when modal closes or has no documents
    }
    // By using `kmlFileIds`, this effect won't run unnecessarily.
    // We disable the lint rule because we are intentionally omitting `loadKmlFiles`
    // from the dependencies to prevent the infinite loop. The most recent version
    // of the function is always available here anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, kmlFileIds])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const coords = coordinates ? parseCoordinates(coordinates) : { lat: 0, lng: 0 }
  const hasValidCoords = coords.lat !== 0 || coords.lng !== 0;

  // Define some colors to cycle through for different shapes
  const shapeColors = ['#42d4f4']

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Property Location</h2>
            {propertyName && <p className="text-gray-600 text-sm">{propertyName}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Content */}
        <div className="flex-1 relative">
          {isClient ? (
            <MapContainer
              center={hasValidCoords ? [coords.lat, coords.lng] : [20.5937, 78.9629]} // Default to India center
              zoom={hasValidCoords ? 16 : 5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en"
              />

              {/* Center Marker */}
              {hasValidCoords && (
                  <Marker position={[coords.lat, coords.lng]}>
                      <Popup>
                          <div className="p-1">
                              <h3 className="font-semibold">{propertyName || 'Property'}</h3>
                              {propertyAddress && <p className="text-sm text-gray-600 mt-1">{propertyAddress}</p>}
                          </div>
                      </Popup>
                  </Marker>
              )}
              
              {/* --- ✨ NEW AND IMPROVED RENDERING LOGIC --- */}
              {kmlLayers.map((shape, index) => {
                const color = shapeColors[index % shapeColors.length];
                
                if (shape.type === 'Polygon' && shape.coordinates) {
                  return (
                    <Polygon key={index} positions={shape.coordinates} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.4 }}>
                      <Popup>{shape.name}</Popup>
                    </Polygon>
                  )
                }

                if (shape.type === 'LineString' && shape.coordinates) {
                  return (
                    <Polyline key={index} positions={shape.coordinates} pathOptions={{ color: color }}>
                       <Popup>{shape.name}</Popup>
                    </Polyline>
                  )
                }
                
                if (shape.type === 'Point' && shape.coordinates) {
                    return (
                        <Marker key={index} position={shape.coordinates}>
                            <Popup>{shape.name}</Popup>
                        </Marker>
                    )
                }
                
                return null;
              })}

              {isLoadingKml && (
                <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-[1000]">
                  <p className="text-sm text-gray-600">Loading KML Layers...</p>
                </div>
              )}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">Loading Map...</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-end items-center">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FullMapModal