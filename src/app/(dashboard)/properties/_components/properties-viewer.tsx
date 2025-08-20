'use client'
import { PropertySortField, PropertySortOrder } from '@/types/property.types'
import { PropertiesActionsButton } from './properties-action-button'
import { PropertiesAddButton } from './properties-add-button'
import { PropertiesFilterButton } from './properties-filter-button'
import { PropertiesSortButton } from './properties-sort-button'

const PropertiesViewer = () => {
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
    </div>
  )
}

export default PropertiesViewer
