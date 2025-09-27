'use client'
import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { formatCoordinates } from '@/utils/coordinateUtils'
import { Bell, ChevronDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FileIcon } from '../../documents/_components/file-icon'
import FullMapModal from '../_components/map-model'
import MiniMap from '../_components/minimap'
import { CustomField } from '../_components/properties-edit-model'


export interface PropertiesDetailsModelProps {
  property: Properties | null
  isOpen: boolean
  onClose: () => void
  onEditClick?: (property: Properties) => void
}

const MobilePropertiesDetailsModel = ({
  property,
  isOpen,
  onClose,
  onEditClick,
}: PropertiesDetailsModelProps) => {
  const [openItems, setOpenItems] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  const uploadedDocuments = property?.documents

  const handleMiniMapClick = () => {
    setIsMapModalOpen(true)
  }

  const handleMapModalClose = () => {
    setIsMapModalOpen(false)
  }

  // Helper function to get coordinates in the correct format for display
  const getCoordinatesForDisplay = () => {
    if (!property) return ''

    // If backend sends separate latitude/longitude, combine them
    if ((property as any).latitude && (property as any).longitude) {
      return formatCoordinates(
        (property as any).latitude,
        (property as any).longitude
      )
    }

    // Fallback to existing coordinates field
    return property.coordinates || ''
  }

  // Helper function to get coordinates for map components (they expect the old format)
  const getCoordinatesForMap = () => {
    if (!property) return ''

    // If backend sends separate latitude/longitude, convert to old format
    if ((property as any).latitude && (property as any).longitude) {
      const lat = parseFloat((property as any).latitude)
      const lng = parseFloat((property as any).longitude)

      if (!isNaN(lat) && !isNaN(lng)) {
        const latDir = lat >= 0 ? 'N' : 'S'
        const lngDir = lng >= 0 ? 'E' : 'W'
        return `${Math.abs(lat)} ${latDir}; ${Math.abs(lng)} ${lngDir}`
      }
    }

    // Fallback to existing coordinates field
    return property.coordinates || ''
  }

  useEffect(() => {
    if (property?.additionalDetails) {
      const customFieldsFromProperty = Object.entries(
        property.additionalDetails
      ).map(([key, value], index) => ({
        id: `custom-${index}`,
        label: key,
        value: String(value),
      }))
      setCustomFields(customFieldsFromProperty)
    }
  }, [property])

  if (!property) return null

  return (
    <>
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/60 bg-opacity-30"
          onClick={onClose}
        />
        
        {/* Bottom Sheet Modal */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[85vh] flex-col rounded-t-xl bg-white shadow-2xl">
          {/* Drag Handle */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-12 rounded-full bg-gray-300"></div>
          </div>
          
          {/* Header */}
          <div className="bg-[#F2F2F2] border-b border-gray-200 rounded-t-2xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <h2 className="truncate text-lg font-semibold">
                  Property Details
                </h2>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <Button className="text-primary cursor-pointer rounded-full bg-white hover:text-white h-8 w-8 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-8 w-8 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Legal Status and Property Value */}
            <div className="space-y-3">
              <div className="flex w-full justify-between rounded-md bg-[#F2F2F2] px-3 py-3">
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Legal Status
                  </h3>
                  <h2 className="text-base font-semibold">
                    {property?.legalStatus}
                  </h2>
                  {openItems && (
                    <div className="flex flex-col space-y-3 pt-3">
                      <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">
                          Parties
                        </h3>
                        <h2 className="text-base font-semibold">
                          {property?.legalParties}
                        </h2>
                      </div>

                      <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">
                          Case Number
                        </h3>
                        <h2 className="text-base font-semibold">
                          {property?.caseNumber}
                        </h2>
                      </div>

                      <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">
                          Case Type
                        </h3>
                        <h2 className="text-base font-semibold">
                          {property?.caseType}
                        </h2>
                      </div>

                      <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">
                          Next Hearing
                        </h3>
                        <h2 className="text-base font-semibold">
                          {property?.nextHearing}
                        </h2>
                      </div>
                    </div>
                  )}
                </div>

                {property?.isDisputed && (
                  <div className="flex pt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                      onClick={() => setOpenItems((prev) => !prev)}
                    >
                      <ChevronDown
                        className={`h-4 w-4 font-bold transition-transform ${
                          openItems ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </div>
                )}
              </div>

              <div className="w-full rounded-md bg-[#F2F2F2] px-3 py-3">
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Total Property Value
                </h3>
                <h2 className="text-base font-semibold">
                  ₹ {property?.value}
                </h2>
              </div>
            </div>

            {/* Map and Property Details */}
            <div className="space-y-3">
              <div className="w-full rounded-md bg-[#F2F2F2] p-3">
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Mini Map View
                </h3>
                <div className="h-32">
                  <MiniMap
                    coordinates={getCoordinatesForMap()}
                    propertyName={property?.name}
                    onClick={handleMiniMapClick}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-3">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Property Name
                  </h3>
                  <h2 className="text-base font-semibold">
                    {property?.name}
                  </h2>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Property Type
                  </h3>
                  <h2 className="text-base font-semibold">
                    {property?.type}
                  </h2>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Owner
                  </h3>
                  <h2 className="text-base font-semibold">
                    {property?.owner}
                  </h2>
                </div>
              </div>
            </div>

            {/* Address and Coordinates */}
            <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-3">
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">
                  Address
                </h3>
                <h2 className="text-base font-semibold">{property?.address}</h2>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">
                  Co-ordinates
                </h3>
                <h2 className="text-base font-semibold">
                  {getCoordinatesForDisplay()}
                </h2>
              </div>
            </div>

            {/* Extent and Value */}
            <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-3">
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">
                  Extent
                </h3>
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-semibold">
                    {property?.extent}
                  </h2>
                  <h3 className="text-sm font-medium text-gray-500">
                    square yards
                  </h3>
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">
                  Value per square yard
                </h3>
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-semibold">
                    ₹ {property?.valuePerSQ}
                  </h2>
                  <h3 className="text-sm font-medium text-gray-500">
                    /square yard
                  </h3>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-3">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      {field.label}
                    </h3>
                    <h2 className="text-base font-semibold">
                      {field.value}
                    </h2>
                  </div>
                ))}
              </div>
            )}

            {/* Documents Section */}
            {uploadedDocuments && uploadedDocuments.length > 0 && (
              <div className="flex w-full flex-col space-y-3 rounded-md bg-[#F2F2F2] px-3 py-3">
                <h3 className="text-sm font-medium text-gray-500">
                  Documents Uploaded
                </h3>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uploadedDocuments?.map((uploadedDocument) => (
                    <div
                      key={uploadedDocument.doc_id}
                      className="flex justify-between items-center rounded-md bg-white p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon 
                          type={uploadedDocument.fileType as string} 
                          className="flex-shrink-0" 
                        />
                        <h2 className="truncate text-sm font-normal">
                          {uploadedDocument.name}
                        </h2>
                      </div>

                      <h3 className="text-sm font-medium text-gray-400 ml-2">
                        {uploadedDocument.size} KB
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>

      {/* Full Map Modal */}
      <FullMapModal
        isOpen={isMapModalOpen}
        onClose={handleMapModalClose}
        coordinates={getCoordinatesForMap()}
        propertyName={property?.name}
        propertyAddress={property?.address}
        documents={property?.documents}
      />
    </>
  )
}

export default MobilePropertiesDetailsModel