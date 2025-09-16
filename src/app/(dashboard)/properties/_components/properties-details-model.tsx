'use client'
import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { Bell, ChevronDown, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { FileIcon } from '../../documents/_components/file-icon'
import FullMapModal from './map-model'
import MiniMap from './minimap'

export interface PropertiesDetailsModelProps {
  property: Properties | null
  isOpen: boolean
  onClose: () => void
  onEditClick?: (property: Properties) => void
}

const PropertiesDetailsModel = ({
  property,
  isOpen,
  onClose,
  onEditClick,
}: PropertiesDetailsModelProps) => {
  const [openItems, setOpenItems] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const uploadedDocuments = property?.documents

  const handleMiniMapClick = () => {
    setIsMapModalOpen(true)
  }

  const handleMapModalClose = () => {
    setIsMapModalOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[700px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header - unchanged */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h2 className="truncate pl-1 text-xl font-semibold">
                    Property Details
                  </h2>
                </div>
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button className="text-primary cursor-pointer rounded-full bg-white hover:text-white">
                    <Bell />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="flex justify-between gap-3">
                <div className="flex w-full justify-between rounded-md bg-[#F2F2F2] px-3 py-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Legal Status
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.legalStatus}
                    </h2>
                    {openItems && (
                      <div className="flex flex-col space-y-3 pt-3">
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Parties
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.legalParties}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Case Number
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.caseNumber}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Case Type
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.caseType}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Next Hearing
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
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
                        className="hover:text-primary h-4 w-4 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                        onClick={() => setOpenItems((prev) => !prev)}
                      >
                        <ChevronDown
                          className={`h-4 w-4 font-bold ${
                            openItems ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="w-full rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Total Property Value
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    ₹ {property?.value}
                  </h2>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <div className="w-full rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <div className="h-32">
                    <MiniMap
                      coordinates={property?.coordinates}
                      propertyName={property?.name}
                      onClick={handleMiniMapClick}
                    />
                  </div>
                </div>

                <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Property Name
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.name}
                    </h2>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Property Type
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.type}
                    </h2>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Owner
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.owner}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Address
                  </h3>
                  <h2 className="text-lg font-semibold">{property?.address}</h2>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Co-ordinates
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    {property?.coordinates}
                  </h2>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Extent
                  </h3>
                  <div className="flex justify-between">
                    <h2 className="truncate text-lg font-semibold">
                      {property?.extent}
                    </h2>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      square yards
                    </h3>
                  </div>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Value per square yard
                  </h3>
                  <div className="flex justify-between">
                    <h2 className="truncate text-lg font-semibold">
                      ₹ {property?.valuePerSQ}
                    </h2>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      /square yard
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex h-1/2 w-full flex-col space-y-5 overflow-y-auto rounded-md bg-[#F2F2F2] px-3 py-2">
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Documents Uploaded
                </h3>

                <div className="flex flex-col space-y-3">
                  {uploadedDocuments?.map((uploadedDocument) => (
                    <div
                      key={uploadedDocument.doc_id}
                      className="w-ful flex justify-between rounded-md bg-white p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <FileIcon type={uploadedDocument.fileType as string} />
                        <h2 className="truncate text-sm font-extralight">
                          {uploadedDocument.name}
                        </h2>
                      </div>

                      <h3 className="mb-1 text-sm font-medium text-gray-400">
                        {uploadedDocument.size} KB
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="bg-primary hover:bg-secondary h-11 w-[200px] cursor-pointer px-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditClick && property) {
                        onEditClick(property)
                      }
                    }}
                  >
                    <Pencil /> Edit Property
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Map Modal */}
      <FullMapModal
        isOpen={isMapModalOpen}
        onClose={handleMapModalClose}
        coordinates={property?.coordinates}
        propertyName={property?.name}
        propertyAddress={property?.address}
      />
    </>
  )
}

export default PropertiesDetailsModel
