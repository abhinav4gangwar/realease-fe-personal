'use client'

import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { formatCoordinates } from '@/utils/coordinateUtils'
import {
  AlertTriangle,
  ChevronRight,
  DollarSign,
  Home,
  MapPin,
  Maximize2,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface MapPropertiesSidebarProps {
  properties: Properties[]
  isOpen: boolean
  onClose: () => void
  onPropertyClick: (property: Properties) => void
  onPropertyHover?: (property: Properties | null) => void
}

const MapPropertiesSidebar = ({
  properties,
  onClose,
  onPropertyClick,
  onPropertyHover,
}: MapPropertiesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.owner?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    )
  })

  const getCoordinatesDisplay = (property: Properties) => {
    if ((property as any).latitude && (property as any).longitude) {
      return formatCoordinates(
        (property as any).latitude,
        (property as any).longitude
      )
    }
    return property.coordinates || ''
  }

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Properties</h2>
              <p className="text-xs text-gray-500">
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

       
        <input
          type="text"
          placeholder="Search properties..."
          className="mt-3 w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {filteredProperties.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MapPin className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No properties found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-md"
                onClick={() => onPropertyClick(property)}
                onMouseEnter={() => onPropertyHover?.(property)}
                onMouseLeave={() => onPropertyHover?.(null)}
              >
                {/* header */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="truncate text-base font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.location}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>

                {/* details grid */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">Owner:</span>
                    <span className="truncate font-medium">{property.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">Extent:</span>
                    <span className="font-medium">{property.extent} sq yd</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-500">Value:</span>
                    <span className="font-semibold text-primary">
                      ₹ {parseInt(property.value).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* disputed badge */}
                {property.isDisputed && (
                  <div className="mt-2 flex items-center gap-1.5 rounded bg-yellow-50 px-2 py-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-800">
                      Disputed Property
                    </span>
                  </div>
                )}

                {/* coordinates */}
                {getCoordinatesDisplay(property) && (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <p className="truncate text-xs text-gray-400">
                      {getCoordinatesDisplay(property)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPropertiesSidebar