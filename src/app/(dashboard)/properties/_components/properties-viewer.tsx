'use client'
import {
  FilterState,
  Properties,
  PropertySortField,
  PropertySortOrder,
} from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import ScrollToTop from '../../documents/_components/scroll-to-top'
import ArchivePropertyModal from './archive-property-model'
import CreatePropertyModal from './create-property-modal'
import { PropertiesActionsButton } from './properties-action-button'
import { PropertiesAddButton } from './properties-add-button'
import PropertiesDetailsModel from './properties-details-model'
import PropertiesEditModel from './properties-edit-model'
import { PropertiesFilterButton } from './properties-filter-button'
import PropertiesFilterModel from './properties-filter-model'
import PropertiesListView from './properties-list-view'
import { PropertiesSortButton } from './properties-sort-button'

export interface PropertiesViewerProps {
  allProperties: Properties[]
  onPropertyCreated: () => void
}

const PropertiesViewer = ({
  allProperties,
  onPropertyCreated,
}: PropertiesViewerProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreatePropertyModalOpen, setisCreatePropertyModalOpen] =
    useState(false)
  const [isEditPropertyModalOpen, setisEditPropertyModalOpen] = useState(false)
  const [isFilterModalOpen, setisFilterModalOpen] = useState(false)

  const [sortField, setSortField] = useState<PropertySortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    owners: [],
    locations: [],
    propertyTypes: [],
    legalStatuses: [],
  })
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)

  const handleActionSelect = (actionType: string) => {
    console.log(actionType)
  }

  const handleCreatePropertyClose = () => {
    setisCreatePropertyModalOpen(false)
    onPropertyCreated()
  }

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSortField(field)
    setSortOrder(order)
  }

  const handleAddSelect = () => {
    setisCreatePropertyModalOpen(true)
  }

  const handleFilterSelect = () => {
    setisFilterModalOpen(true)
  }

  const handlePropertyInfo = (property: Properties) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleEditClick = (property: Properties) => {
    setSelectedProperty(property)
    setisEditPropertyModalOpen(true)
  }

  const handleArchiveClick = (property: Properties) => {
    setIsArchiveModalOpen(true)
    setSelectedProperty(property)
  }

  const handleDownloadClick = (property: Properties) => {
    console.log('Download', property)
  }

  const handleShareClick = (property: Properties) => {
    setSelectedProperty(property)
    console.log('Share property model open for', property)
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

  const confirmArchive = async () => {
    if (!selectedProperty) return

    try {
      const response = await apiClient.put('/dashboard/properties/archive', [
        {
          itemId: Number.parseInt(selectedProperty.id),
        },
      ])
      setIsModalOpen(false)
      setSelectedProperty(null)
      onPropertyCreated()
      setIsArchiveModalOpen(false)
      setisEditPropertyModalOpen(false)
      const successMessage =
        response.data?.message || 'Property archived successfully'
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to archive property. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Properties
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PropertiesFilterButton onFilterSelect={handleFilterSelect} />
          <PropertiesSortButton onSortChange={handleSortChange} />
          <PropertiesActionsButton onActionSelect={handleActionSelect} />
          <PropertiesAddButton onAddSelect={handleAddSelect} />
        </div>
      </div>

      <div>
        <div className="mt-5 rounded-lg bg-white p-6">
          <PropertiesListView
            properties={sortedAndFilteredProperties}
            selectedPropertyId={selectedProperty?.id}
            onEditClick={handleEditClick}
            onDownloadClick={handleDownloadClick}
            onShareClick={handleShareClick}
            onPropertyInfo={handlePropertyInfo}
          />
        </div>
      </div>

      <ScrollToTop />

      <PropertiesDetailsModel
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProperty(null)
        }}
        onEditClick={handleEditClick}
      />

      <PropertiesEditModel
        property={selectedProperty}
        isOpen={isEditPropertyModalOpen}
        onClose={() => {
          setisEditPropertyModalOpen(false)
          setSelectedProperty(null)
          setIsModalOpen(false)
        }}
        handleAddAnother={() => {
          setisEditPropertyModalOpen(false)
          setisCreatePropertyModalOpen(true)
          setSelectedProperty(null)
        }}
        onArchiveClick={handleArchiveClick}
      />

      <PropertiesFilterModel
        properties={allProperties}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setisFilterModalOpen(false)
        }}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />

      <CreatePropertyModal
        isOpen={isCreatePropertyModalOpen}
        onClose={handleCreatePropertyClose}
      />

      <ArchivePropertyModal
        isOpen={isArchiveModalOpen}
        onCancel={() => setIsArchiveModalOpen(false)}
        onConfirm={confirmArchive}
      />
    </div>
  )
}

export default PropertiesViewer
