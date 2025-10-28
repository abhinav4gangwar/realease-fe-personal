'use client'
import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

export interface PropertiesListViewProps {
  properties: Properties[]
  selectedPropertyId?: string
  onRestoreClick?: (property: Properties) => void
  onDeleteClick?: (property: Properties) => void
  selectedProperties?: string[]
  onSelectAll?: () => void
  onToggleSelect?: (id: string) => void
  selectAllState?: 'none' | 'some' | 'all'
}

const TrashPropertiesListView = ({
  properties,
  selectedPropertyId,
  onDeleteClick,
  selectedProperties = [],
  onSelectAll,
  onRestoreClick,
  onToggleSelect,
  selectAllState = 'none',
}: PropertiesListViewProps) => {
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = selectAllState === 'some'
    }
  }, [selectAllState])

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="text-md text-secondary grid grid-cols-16 gap-4 px-4 py-2 font-semibold">
        <div className="col-span-6 flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#f16969]"
            ref={headerCheckboxRef}
            checked={selectAllState === 'all'}
            onChange={(e) => {
              e.stopPropagation()
              onSelectAll?.()
            }}
          />
          <div>Property Name</div>
        </div>
        <div className="col-span-3 text-left">Type</div>
        <div className="col-span-3 text-left">Owner</div>
        <div className="col-span-4 text-left">Actions</div>
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
        >
          <div className="col-span-6 flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#f16969]"
              checked={selectedProperties.includes(property.id)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation()
                onToggleSelect?.(property.id)
              }}
            />
            <span className="truncate text-sm font-semibold">
              {property.name}
            </span>
          </div>

          <div className="col-span-3 truncate pl-3 text-left text-sm text-[#9B9B9D]">
            {property.type}
          </div>

          <div className="col-span-3 truncate pl-3 text-left text-sm text-[#9B9B9D]">
            {property.owner}
          </div>

          <div className="col-span-4 truncate text-left text-sm text-[#9B9B9D]">
            <div className="flex gap-1 pl-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestoreClick?.(property)
                }}
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick?.(property)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrashPropertiesListView
