import { Button } from '@/components/ui/button'
import { Ellipsis } from 'lucide-react'
import { PropertiesListViewProps } from '../_components/properties-list-view'

const MobilePropertiesList = ({
  properties,
  selectedPropertyId,
  onPropertyInfo,
}: PropertiesListViewProps) => {
  return (
    <div className="space-y-4">
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

            <div className="pt-2 text-left text-sm text-[#9B9B9D]">
              Extent: {property.extent}
            </div>
            <div className="pt-2 text-left text-sm text-[#9B9B9D]">
              Location: {property.location}
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
              <Ellipsis className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MobilePropertiesList
