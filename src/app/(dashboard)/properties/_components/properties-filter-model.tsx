import { Button } from '@/components/ui/button'
import {
  filterCategories,
  FilterCategory,
  FilterState,
  Properties,
} from '@/types/property.types'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

export interface PropertiesFilterModelProps {
  properties: Properties[]
  isOpen: boolean
  onClose: () => void
  onApplyFilters?: (filters: FilterState) => void
  initialFilters?: FilterState
}

const PropertiesFilterModel = ({
  properties,
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}: PropertiesFilterModelProps) => {
  const [filters, setFilters] = useState<FilterState>({
    owners: initialFilters?.owners || [],
    locations: initialFilters?.locations || [],
    propertyTypes: initialFilters?.propertyTypes || [],
    legalStatuses: initialFilters?.legalStatuses || [],
  })

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('owners')

  const filterOptions = useMemo(() => {
    const owners = [...new Set(properties.map((p) => p.owner).filter(Boolean))]
    const locations = [
      ...new Set(properties.map((p) => p.location).filter(Boolean)),
    ]
    const propertyTypes = [
      ...new Set(properties.map((p) => p.type).filter(Boolean)),
    ]
    const legalStatuses = ['Disputed', 'Non Disputed']

    return {
      owners: owners.sort(),
      locations: locations.sort(),
      propertyTypes: propertyTypes.sort(),
      legalStatuses: legalStatuses,
    }
  }, [properties])

  const getCategoryCount = (category: FilterCategory) => {
    return filters[category].length
  }

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [activeCategory]: checked
        ? [...prev[activeCategory], option]
        : prev[activeCategory].filter((item) => item !== option),
    }))
  }

  const handleClearAll = () => {
    setFilters({
      owners: [],
      locations: [],
      propertyTypes: [],
      legalStatuses: [],
    })
  }

  const handleApply = () => {
    onApplyFilters?.(filters)
    setActiveCategory("owners")
    onClose()
  }

  const getCurrentOptions = () => {
    return filterOptions[activeCategory] || []
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-gray-400 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-[#F2F2F2] px-4 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-secondary text-lg font-semibold">Filter</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white hover:bg-gray-400"
            onClick={onClose}
          >
            <X className="h-4 w-4 font-bold" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1">
          {/* Left Sidebar */}
          <div className="w-48 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="space-y-2">
                {filterCategories.map((category) => {
                  const count = getCategoryCount(category.key)
                  const isActive = activeCategory === category.key

                  return (
                    <Button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className={`flex w-full items-center justify-between rounded py-6 text-left text-sm transition-colors cursor-pointer hover:bg-[#A2CFE33D] ${
                        isActive
                          ? ' bg-[#A2CFE33D] text-secondary'
                          : 'bg-transparent text-secondary'
                      }`}
                    >
                      <span className="font-semibold">{category.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs text-secondary font-semibold">
                          {count}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Right Panel Header */}

            {/* Options List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {getCurrentOptions().map((option) => {
                  const isChecked = filters[activeCategory].includes(option)

                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center rounded px-2 py-3 transition-colors hover:bg-[#A2CFE33D]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(option, e.target.checked)
                        }
                        className="h-4 w-4 accent-[#f16969]"
                      />
                      <span className={`ml-3 flex-1 text-sm ${isChecked && "font-semibold"}`}>
                        {option}
                      </span>
                    </label>
                  )
                })}
                {getCurrentOptions().length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500">
                      No options available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end rounded-b-lg bg-[#F2F2F2] px-4 py-3">
          <div className="flex gap-3">
            <Button
              onClick={handleClearAll}
              variant="outline"
               className="hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 border border-gray-400 bg-transparent px-6 font-semibold text-black hover:text-white"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6"
            >
              Apply →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesFilterModel
