'use client'

import { Properties } from '@/types/property.types'
import { formatCoordinates } from '@/utils/coordinateUtils'
import {
  AlertTriangle,
  ChevronDown,
  DollarSign,
  Home,
  MapPin,
  Maximize2,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface MobilePropertyListProps {
  properties: Properties[]
  isOpen: boolean
  onClose: () => void
  onPropertyClick: (property: Properties) => void
}

const MobilePropertyList = ({
  properties,
  isOpen,
  onClose,
  onPropertyClick,
}: MobilePropertyListProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragCurrent, setDragCurrent] = useState<number | null>(null)

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart !== null) {
      setDragCurrent(e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => {
    if (dragStart !== null && dragCurrent !== null) {
      const diff = dragCurrent - dragStart
      if (diff > 100) {
        onClose()
      }
    }
    setDragStart(null)
    setDragCurrent(null)
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

  const dragOffset = dragStart !== null && dragCurrent !== null 
    ? Math.max(0, dragCurrent - dragStart) 
    : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1001] bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[1002] flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          transform: isOpen 
            ? `translateY(${dragOffset}px)` 
            : 'translateY(100%)',
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Properties</h2>
                <p className="text-sm text-gray-500">
                  {filteredProperties.length}{' '}
                  {filteredProperties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search properties..."
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {filteredProperties.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">
                No properties found
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all active:scale-[0.98] active:shadow-md"
                  onClick={() => onPropertyClick(property)}
                >
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {property.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium text-gray-900">
                        {property.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium text-gray-900">
                        {property.owner}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Extent:</span>
                      <span className="font-medium text-gray-900">
                        {property.extent} sq yd
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Value:</span>
                      <span className="font-bold text-primary">
                        ₹ {parseInt(property.value).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Disputed Badge */}
                  {property.isDisputed && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Disputed Property
                      </span>
                    </div>
                  )}

                  {/* Coordinates */}
                  {getCoordinatesDisplay(property) && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400">
                        {getCoordinatesDisplay(property)}
                      </p>
                    </div>
                  )}

                  {/* View on Map indicator */}
                  <div className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-primary">
                    <span>Tap to view on map</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MobilePropertyList