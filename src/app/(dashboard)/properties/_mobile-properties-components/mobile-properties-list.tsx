import { Button } from '@/components/ui/button'
import { EllipsisVertical, Map, MapPin } from 'lucide-react'
import { PropertiesListViewProps } from '../_components/properties-list-view'

const MobilePropertiesList = ({
  properties,
  selectedPropertyId,
  onPropertyInfo,
}: PropertiesListViewProps) => {
  if (properties.length === 0) {
    return <div className='text-lg font-semibold'>No properties to show</div>
  }
  return (
    <div className="space-y-6">
      {properties.map((property) => (
        <div
          key={property.id}
          className={`flex justify-between ${
            selectedPropertyId === property.id
              ? 'border-blue-200 bg-blue-50'
              : ''
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-[220px] truncate text-sm font-medium">
                {property.name}
              </span>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs text-[#9B9B9D]">
              <div className="flex w-[100px] flex-1 items-center gap-2">
                <MapPin className="size-4" />
                <span className="truncate">{property.location}</span>
              </div>

              <div className="flex w-[100px] items-center justify-end gap-2">
                <Map className="size-4" />
                <span className="truncate">{property.extent}</span>
              </div>
            </div>
          </div>

          <div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-7 w-7 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onPropertyInfo(property)
              }}
            >
              <EllipsisVertical className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MobilePropertiesList
