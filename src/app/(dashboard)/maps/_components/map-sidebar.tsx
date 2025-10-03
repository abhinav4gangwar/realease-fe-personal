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
  isOpen,
  onClose,
  onPropertyClick,
  onPropertyHover,
}: MapPropertiesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter properties based on search
  const filteredProperties = properties.filter((property) => {
    const query = searchQuery.toLowerCase()
    return (
      property.name?.toLowerCase().includes(query) ||
      property.location?.toLowerCase().includes(query) ||
      property.owner?.toLowerCase().includes(query) ||
      property.type?.toLowerCase().includes(query)
    )
  })

  // Format coordinates for display
  const getCoordinatesDisplay = (property: Properties) => {
    if ((property as any).latitude && (property as any).longitude) {
      return formatCoordinates(
        (property as any).latitude,
        (property as any).longitude
      )
    }
    return property.coordinates || ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 z-[1000] flex h-full w-[400px] flex-col border-r border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="bg-[#F2F2F2] shadow-md">
        <div className="flex items-center justify-between p-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MapPin className="text-primary h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold">Properties</h2>
              <p className="text-sm text-gray-500">
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'property' : 'properties'}{' '}
                found
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary h-8 w-8 flex-shrink-0 rounded-full bg-[#CDCDCE] text-white hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-4">
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
                className="group hover:border-primary cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                onClick={() => onPropertyClick(property)}
                onMouseEnter={() => onPropertyHover?.(property)}
                onMouseLeave={() => onPropertyHover?.(null)}
              >
                {/* Property Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.location}</span>
                    </p>
                  </div>
                  <ChevronRight className="group-hover:text-primary h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Property Details Grid */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">
                      {property.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Owner:</span>
                    <span className="truncate font-medium text-gray-900">
                      {property.owner}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Maximize2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Extent:</span>
                    <span className="font-medium text-gray-900">
                      {property.extent} sq yd
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Value:</span>
                    <span className="text-primary font-semibold">
                      ₹ {parseInt(property.value).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Disputed Badge */}
                {property.isDisputed && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Disputed Property
                    </span>
                  </div>
                )}

                {/* Coordinates Footer */}
                {getCoordinatesDisplay(property) && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
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
