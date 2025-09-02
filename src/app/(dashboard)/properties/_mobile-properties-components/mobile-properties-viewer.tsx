'use client'
import { Input } from '@/components/ui/input'
import {
  FilterState,
  Properties,
  PropertySortField,
  PropertySortOrder,
} from '@/types/property.types'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import ScrollToTop from '../../documents/_components/scroll-to-top'
import { PropertiesFilterButton } from '../_components/properties-filter-button'
import { PropertiesSortButton } from '../_components/properties-sort-button'
import { PropertiesViewerProps } from '../_components/properties-viewer'
import MobilePropertiesDetailsModel from './mobile-properties-details-model'
import MobilePropertiesFilterModel from './mobile-properties-filter-model'
import MobilePropertiesList from './mobile-properties-list'

const MobilePropertiesViewer = ({ allProperties }: PropertiesViewerProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isFilterModalOpen, setisFilterModalOpen] = useState(false)

  const [sortField, setSortField] = useState<PropertySortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    owners: [],
    locations: [],
    propertyTypes: [],
    legalStatuses: [],
  })

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSortField(field)
    setSortOrder(order)
  }

  const handleFilterSelect = () => {
    setisFilterModalOpen(true)
  }

  const handlePropertyInfo = (property: Properties) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      if (
        activeFilters.owners.length > 0 &&
        !activeFilters.owners.includes(property.owner)
      ) {
        return false
      }
      if (
        activeFilters.locations.length > 0 &&
        !activeFilters.locations.includes(property.location)
      ) {
        return false
      }
      if (
        activeFilters.propertyTypes.length > 0 &&
        !activeFilters.propertyTypes.includes(property.type)
      ) {
        return false
      }
      if (activeFilters.legalStatuses.length > 0) {
        const isDisputed = property.isDisputed === true
        const propertyStatus = isDisputed ? 'Disputed' : 'Non Disputed'

        if (!activeFilters.legalStatuses.includes(propertyStatus)) {
          return false
        }
      }

      return true
    })
  }, [allProperties, activeFilters])

  const sortProperties = (properties: Properties[]) => {
    return properties.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'dateAdded':
          if (a.dateAdded && b.dateAdded) {
            const dateA = new Date(a.dateAdded)
            const dateB = new Date(b.dateAdded)
            comparison = dateA.getTime() - dateB.getTime()
          } else {
            comparison = a.dateAdded ? -1 : b.dateAdded ? 1 : 0
          }
          break

        case 'value':
          const valueA = parseFloat(a.value?.replace(/[^0-9.-]+/g, '') || '0')
          const valueB = parseFloat(b.value?.replace(/[^0-9.-]+/g, '') || '0')
          comparison = valueA - valueB
          break

        case 'name':
        case 'owner':
          const aValue = a[sortField] || ''
          const bValue = b[sortField] || ''
          comparison = aValue.localeCompare(bValue)
          break

        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const sortedAndFilteredProperties = useMemo(() => {
    return sortProperties([...filteredProperties])
  }, [filteredProperties, sortField, sortOrder])

  return (
    <div>
      <div className="flex space-x-4">
        <div className="flex justify-center">
          <div className="relative w-full">
            <Search className="text-secondary absolute top-1/2 left-3 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search Properties"
              className="h-11 w-full bg-white pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PropertiesFilterButton onFilterSelect={handleFilterSelect} />
          <PropertiesSortButton onSortChange={handleSortChange} />
        </div>
      </div>

      <div className="mb-16">
        <div className="mt-5 rounded-lg bg-white p-6">
          <MobilePropertiesList
            properties={sortedAndFilteredProperties}
            selectedPropertyId={selectedProperty?.id}
            onPropertyInfo={handlePropertyInfo}
          />
        </div>
      </div>

      <ScrollToTop />

      <MobilePropertiesDetailsModel
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProperty(null)
        }}
      />

      <MobilePropertiesFilterModel
        properties={allProperties}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setisFilterModalOpen(false)
        }}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </div>
  )
}

export default MobilePropertiesViewer
