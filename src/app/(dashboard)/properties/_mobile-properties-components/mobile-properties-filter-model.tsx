import { Button } from "@/components/ui/button"
import { filterCategories, FilterCategory, FilterState } from "@/types/property.types"
import { ChevronLeft, X } from "lucide-react"
import { useMemo, useState } from "react"
import { PropertiesFilterModelProps } from "../_components/properties-filter-model"

const MobilePropertiesFilterModel = ({
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

  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(null)

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
    if (!activeCategory) return
    
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
    setActiveCategory(null)
    onClose()
  }

  const getCurrentOptions = () => {
    return activeCategory ? (filterOptions[activeCategory] || []) : []
  }


  if (!properties) return null

  return (
    <div className={`${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 bg-opacity-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col rounded-t-2xl bg-white shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-12 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#F2F2F2] px-4 py-4 rounded-t-xl">
          <div className="flex items-center gap-2">
            {activeCategory && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2"
                onClick={() => setActiveCategory(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-secondary text-lg font-semibold">
              {activeCategory ? 
                filterCategories.find(cat => cat.key === activeCategory)?.label : 
                'Filter Properties'
              }
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-8 w-8 cursor-pointer rounded-full bg-[#CDCDCE] text-white hover:bg-gray-400"
              onClick={onClose}
            >
              <X className="h-4 w-4 font-bold" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!activeCategory ? (
            // Categories List View
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                {filterCategories.map((category) => {
                  const count = getCategoryCount(category.key)

                  return (
                    <Button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className="flex w-full items-center justify-between rounded-lg py-4 px-4 text-left transition-colors cursor-pointer hover:bg-[#A2CFE33D] bg-gray-50 text-secondary border-0"
                    >
                      <span className="font-semibold text-base">{category.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-primary text-white px-3 py-1.5 text-xs font-semibold">
                          {count}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ) : (
            // Options List View
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {getCurrentOptions().map((option) => {
                  const isChecked = filters[activeCategory].includes(option)

                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center rounded-lg px-3 py-4 transition-colors hover:bg-[#A2CFE33D] border border-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(option, e.target.checked)
                        }
                        className="h-5 w-5 accent-[#f16969]"
                      />
                      <span className={`ml-4 flex-1 text-base ${isChecked && "font-semibold text-primary"}`}>
                        {option}
                      </span>
                    </label>
                  )
                })}
                {getCurrentOptions().length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-base text-gray-500">
                      No options available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show on main view */}
        {!activeCategory && (
          <div className="border-t border-gray-200 bg-[#F2F2F2] px-4 py-4">
            <div className="flex gap-3">
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="flex-1 hover:bg-secondary h-12 cursor-pointer border border-gray-400 bg-transparent font-semibold text-black hover:text-white"
              >
                Clear All
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 bg-primary hover:bg-secondary h-12 cursor-pointer font-semibold"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Category-specific footer with quick apply */}
        {activeCategory && (
          <div className="border-t border-gray-200 bg-[#F2F2F2] px-4 py-3">
            <div className="flex gap-3">
              <Button
                onClick={() => setActiveCategory(null)}
                variant="outline"
                className="flex-1 h-10 border border-gray-400 bg-transparent font-semibold text-black hover:bg-gray-100"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  const currentCount = getCategoryCount(activeCategory)
                  if (currentCount > 0) {
                    setActiveCategory(null)
                  }
                }}
                className="flex-1 bg-primary hover:bg-secondary h-10 font-semibold"
                disabled={getCategoryCount(activeCategory) === 0}
              >
                Done ({getCategoryCount(activeCategory)})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobilePropertiesFilterModel