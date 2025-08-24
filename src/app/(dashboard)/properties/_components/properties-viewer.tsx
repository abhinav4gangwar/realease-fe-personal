'use client'
import {
  Properties,
  PropertySortField,
  PropertySortOrder,
} from '@/types/property.types'
import { useMemo, useState } from 'react'
import ScrollToTop from '../../documents/_components/scroll-to-top'
import CreatePropertyModal from './create-property-modal'
import { PropertiesActionsButton } from './properties-action-button'
import { PropertiesAddButton } from './properties-add-button'
import PropertiesDetailsModel from './properties-details-model'
import PropertiesEditModel from './properties-edit-model'
import { PropertiesFilterButton } from './properties-filter-button'
import PropertiesFilterModel from './properties-filter-model'
import PropertiesListView from './properties-list-view'
import { PropertiesSortButton } from './properties-sort-button'

interface PropertiesViewerProps {
  allProperties: Properties[]
}

const PropertiesViewer = ({ allProperties }: PropertiesViewerProps) => {
  const [properties, setProperties] = useState<Properties[]>(allProperties)
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

  const handleActionSelect = (actionType: string) => {
    console.log(actionType)
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

  const handleDeleteClick = (property: Properties) => {
    console.log('open delete model for', property)
  }

  const handleDownloadClick = (property: Properties) => {
    console.log('Download', property)
  }

  const handleShareClick = (property: Properties) => {
    setSelectedProperty(property)
    console.log('Share property model open for', property)
  }

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

  const sortedProperties = useMemo(() => {
    return sortProperties([...properties])
  }, [properties, sortField, sortOrder])

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Properties
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
            properties={sortedProperties}
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
        }}
        handleAddAnother={() => {
          setisEditPropertyModalOpen(false)
          setisCreatePropertyModalOpen(true)
          setSelectedProperty(null)
        }}
        onDeleteClick={handleDeleteClick}
      />

      <PropertiesFilterModel
        properties={properties}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setisFilterModalOpen(false)
        }}
      />

      <CreatePropertyModal
        isOpen={isCreatePropertyModalOpen}
        onClose={() => {
          setisCreatePropertyModalOpen(false)
        }}
      />
    </div>
  )
}

export default PropertiesViewer
