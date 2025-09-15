'use client'
import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { Download, Info, Pencil } from 'lucide-react'
import { useState } from 'react'
import { HiShare } from 'react-icons/hi2'

export interface PropertiesListViewProps {
  properties: Properties[]
  selectedPropertyId?: string
  onEditClick?: (property: Properties) => void
  onShareClick?: (property: Properties) => void
  onDownloadClick?: (property: Properties) => void
  onPropertyInfo: (property: Properties) => void
  selectedDocuments?: string[]
  onSelectAll?: () => void
  selectAllState?: "none" | "some" | "all"
}
const PropertiesListView = ({
  properties,
  selectedPropertyId,
  onEditClick,
  onDownloadClick,
  onShareClick,
  onPropertyInfo,
}: PropertiesListViewProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="text-md text-secondary grid grid-cols-16 gap-4 px-4 py-2 font-semibold">
        <div className="col-span-4 flex items-center gap-3">
          <div>Property Name</div>
        </div>
        <div className="col-span-4 text-left">Location</div>
        <div className="col-span-3 text-left">Extent</div>
        <div className="col-span-2 text-left">Type</div>
        <div className="col-span-2 text-left">Owner</div>
      </div>

      {/* Document Rows */}
      {properties.map((property) => (
        <div
          key={property.id}
          className={`grid cursor-pointer grid-cols-16 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
            selectedPropertyId === property.id
              ? 'border-blue-200 bg-blue-50'
              : ''
          }`}
          onMouseEnter={() => setHoveredRow(property.id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <div className="col-span-4 flex items-center gap-3">
            <span className="truncate text-sm font-semibold">
              {property.name}
            </span>
          </div>

          <div className="col-span-4 truncate text-left text-sm text-[#9B9B9D]">
            {property.location}
          </div>
          <div className="col-span-3 truncate pl-2 text-left text-sm text-[#9B9B9D]">
            {property.extent}
          </div>
          <div className="col-span-2 truncate pl-3 text-left text-sm text-[#9B9B9D]">
            {property.type}
          </div>
          <div className="col-span-2 truncate text-left text-sm text-[#9B9B9D]">
            {hoveredRow === property.id ? (
              <div className="flex gap-1 pl-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onEditClick) {
                      onEditClick(property)
                    }
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onDownloadClick) {
                      onDownloadClick(property)
                    }
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onShareClick) {
                      onShareClick(property)
                    }
                  }}
                >
                  <HiShare className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="pl-3">{property.owner}</span>
            )}
          </div>

          <div className="col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-7 w-7 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onPropertyInfo(property)
              }}
            >
              <Info className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PropertiesListView
