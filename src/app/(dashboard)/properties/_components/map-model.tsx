'use client'
import { Button } from '@/components/ui/button'
import { parseCoordinates } from '@/utils/coordinateParser'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { apiClient } from '@/utils/api'

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
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
)

// Fix Leaflet marker icons
let DefaultIcon: any
if (typeof window !== 'undefined') {
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
  DefaultIcon = L.Icon.Default
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
  propertyType,
  isDisputed,
  documents
}: FullMapModalProps) => {
  const [isClient, setIsClient] = useState(false)
  const [kmlLayers, setKmlLayers] = useState<any[]>([])
  const [isLoadingKml, setIsLoadingKml] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load KML files when component opens
  useEffect(() => {
    if (isOpen && documents && documents.length > 0) {
      loadKmlFiles()
    }
  }, [isOpen, documents])

  const loadKmlFiles = async () => {
    if (!documents) return

    const kmlFiles = documents.filter(doc =>
      doc.name.toLowerCase().endsWith('.kml') ||
      doc.fileType.includes('kml') ||
      doc.fileType.includes('xml')
    )

    if (kmlFiles.length === 0) return

    setIsLoadingKml(true)
    const layers: any[] = []

    try {
      for (const kmlFile of kmlFiles) {
        try {
          // Use the apiClient with proper authentication and base URL
          const response = await apiClient.post('/dashboard/documents/download', {
            items: [
              { id: kmlFile.doc_id, type: "file" }
            ]
          }, {
            responseType: 'text' // Ensure we get the raw text content
          })

          if (response.data) {
            const kmlText = response.data

            // Parse KML using DOMParser
            const parser = new DOMParser()
            const kmlDoc = parser.parseFromString(kmlText, 'text/xml')

            // Extract coordinates from KML
            const coordinates = extractKmlCoordinates(kmlDoc)
            if (coordinates.length > 0) {
              layers.push({
                name: kmlFile.name,
                coordinates: coordinates,
                type: 'kml'
              })
              console.log(`✅ Loaded KML file: ${kmlFile.name} with ${coordinates.length} points`)
            } else {
              console.warn(`⚠️ No coordinates found in KML file: ${kmlFile.name}`)
            }
          } else {
            console.error(`❌ Empty response for KML file: ${kmlFile.name}`)
          }
        } catch (error) {
          console.error(`Error loading KML file ${kmlFile.name}:`, error)
        }
      }
    } catch (error) {
      console.error('Error loading KML files:', error)
    }

    setKmlLayers(layers)
    setIsLoadingKml(false)
  }

  const extractKmlCoordinates = (kmlDoc: Document) => {
    const coordinates: Array<[number, number]> = []

    try {
      // Extract coordinates from various KML elements
      const coordElements = kmlDoc.querySelectorAll('coordinates')

      coordElements.forEach(coordElement => {
        const coordText = coordElement.textContent?.trim()
        if (coordText) {
          // KML coordinates are in format: longitude,latitude,altitude (or just longitude,latitude)
          // Split by whitespace, newlines, or multiple spaces
          const coordPairs = coordText.split(/[\s\n\r]+/).filter(pair => pair.trim())

          coordPairs.forEach(pair => {
            const coords = pair.split(',')
            if (coords.length >= 2) {
              const lng = parseFloat(coords[0])
              const lat = parseFloat(coords[1])

              // Validate coordinates are within valid ranges
              if (!isNaN(lat) && !isNaN(lng) &&
                  lat >= -90 && lat <= 90 &&
                  lng >= -180 && lng <= 180) {
                coordinates.push([lat, lng])
              }
            }
          })
        }
      })

      console.log(`📍 Extracted ${coordinates.length} coordinate points from KML`)

      // If no coordinates found, try alternative KML structures
      if (coordinates.length === 0) {
        // Try looking for Point elements
        const pointElements = kmlDoc.querySelectorAll('Point coordinates')
        pointElements.forEach(pointElement => {
          const coordText = pointElement.textContent?.trim()
          if (coordText) {
            const coords = coordText.split(',')
            if (coords.length >= 2) {
              const lng = parseFloat(coords[0])
              const lat = parseFloat(coords[1])
              if (!isNaN(lat) && !isNaN(lng)) {
                coordinates.push([lat, lng])
              }
            }
          }
        })
      }

    } catch (error) {
      console.error('Error extracting KML coordinates:', error)
    }

    return coordinates
  }

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
    <div className="fixed inset-0 z-[60] bg-black/40 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
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

              {/* Render KML Layers */}
              {kmlLayers.map((layer, index) => (
                <Polyline
                  key={`kml-layer-${index}`}
                  positions={layer.coordinates}
                  color="#ff6b6b"
                  weight={3}
                  opacity={0.8}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">KML Layer</h3>
                      <p className="text-sm text-gray-600">{layer.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {layer.coordinates.length} points
                      </p>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {/* Loading indicator for KML */}
              {isLoadingKml && (
                <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-[1000]">
                  <p className="text-sm text-gray-600">Loading KML files...</p>
                </div>
              )}
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
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 space-y-1">
              {coordinates && (
                <div>Coordinates: {coordinates}</div>
              )}
              {kmlLayers.length > 0 && (
                <div className="text-xs">
                  KML Layers: {kmlLayers.map(layer => layer.name).join(', ')}
                </div>
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