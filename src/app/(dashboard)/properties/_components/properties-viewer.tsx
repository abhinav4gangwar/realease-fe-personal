'use client'
import {
  Properties,
  PropertySortField,
  PropertySortOrder,
} from '@/types/property.types'
import { useState } from 'react'
import { PropertiesActionsButton } from './properties-action-button'
import { PropertiesAddButton } from './properties-add-button'
import PropertiesDetailsModel from './properties-details-model'
import { PropertiesFilterButton } from './properties-filter-button'
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

  const handleActionSelect = (actionType: string) => {
    console.log(actionType)
  }

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    console.log(field, order)
  }

  const handleAddSelect = () => {
    console.log('add')
  }

  const handlePropertyInfo = (property: Properties) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
    console.log('Info model open for', property)
  }

  const handleEditClick = (property: Properties) => {
    setSelectedProperty(property)
    console.log('Edit model open for', property)
  }

  const handleDownloadClick = (property: Properties) => {
    console.log('Download', property)
  }

  const handleShareClick = (property: Properties) => {
    setSelectedProperty(property)
    console.log('Share property model open for', property)
  }

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Properties
        </div>

        <div className="flex items-center gap-4">
          <PropertiesFilterButton />
          <PropertiesSortButton onSortChange={handleSortChange} />
          <PropertiesActionsButton onActionSelect={handleActionSelect} />
          <PropertiesAddButton onAddSelect={handleAddSelect} />
        </div>
      </div>

      <div>
        <div className="mt-5 rounded-lg bg-white p-6">
          <PropertiesListView
            properties={properties}
            selectedPropertyId={selectedProperty?.id}
            onEditClick={handleEditClick}
            onDownloadClick={handleDownloadClick}
            onShareClick={handleShareClick}
            onPropertyInfo={handlePropertyInfo}
          />
        </div>
      </div>

      <PropertiesDetailsModel
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProperty(null)
        }}
      />
    </div>
  )
}

export default PropertiesViewer
