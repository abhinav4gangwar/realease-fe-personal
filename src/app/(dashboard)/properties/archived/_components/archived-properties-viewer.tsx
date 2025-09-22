'use client'

import {
  FilterState,
  Properties,
  PropertySortField,
  PropertySortOrder,
} from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import ScrollToTop from '@/app/(dashboard)/documents/_components/scroll-to-top'
import ArchiveToggle from '../../_components/archive-toggle'
import { PropertiesFilterButton } from '../../_components/properties-filter-button'
import PropertiesFilterModel from '../../_components/properties-filter-model'
import { PropertiesSortButton } from '../../_components/properties-sort-button'
import { PropertiesViewerProps } from '../../_components/properties-viewer'
import { ArchiveActionsButton } from './archive-action-button'
import ArchivedPropertiesListView from './archived-properties-list-view'
import BulkDeletePropertyModal from './bulk-delete-model'
import BulkUnarchivePropertyModal from './bulk-unarchive-model'
import DeletePropertyModal from './delete-model'
import UnarchivePropertyModal from './unarchive-model'

const ArchivedPropertiesViewer = ({
  allProperties,
  onPropertyCreated,
}: PropertiesViewerProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(
    null
  )
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  const [sortField, setSortField] = useState<PropertySortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    owners: [],
    locations: [],
    propertyTypes: [],
    legalStatuses: [],
  })
  const [isunarchiveModalOpen, setIsunarchiveModalOpen] = useState(false)
  const [isBulkunarchiveModalOpen, setIsBulkunarchiveModalOpen] =
    useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSortField(field)
    setSortOrder(order)
  }

  const handleFilterSelect = () => {
    setIsFilterModalOpen(true)
  }

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  const handleActionSelect = (actionType: string) => {
    switch (actionType) {
      case 'delete':
        if (selectedProperties.length > 0) {
          setIsBulkDeleteModalOpen(true)
        }
        break
      case 'unarchive':
        if (selectedProperties.length > 0) {
          setIsBulkunarchiveModalOpen(true)
        }
        break
    }
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

  // sorting logic
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

  const handleToggleSelect = (id: string) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const allPropertyIds = sortedAndFilteredProperties.map((p) => p.id)
    if (selectedProperties.length === allPropertyIds.length) {
      setSelectedProperties([])
    } else {
      setSelectedProperties(allPropertyIds)
    }
  }

  const getSelectAllState = () => {
    const allPropertyIds = sortedAndFilteredProperties.map((p) => p.id)
    if (selectedProperties.length === 0) {
      return 'none'
    } else if (
      selectedProperties.length === allPropertyIds.length &&
      allPropertyIds.length > 0
    ) {
      return 'all'
    } else {
      return 'some'
    }
  }

  useEffect(() => {
    const visibleIds = new Set(sortedAndFilteredProperties.map((p) => p.id))
    setSelectedProperties((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [sortedAndFilteredProperties])

  const handleUnarchiveClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsunarchiveModalOpen(true)
  }

  const handleDeleteClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsDeleteModalOpen(true)
  }

  const confirmUnarchive = async () => {
    if (!selectedProperty) return

    try {
      const response = await apiClient.put('/dashboard/properties/archive', [
        {
          itemId: Number.parseInt(selectedProperty.id),
        },
      ])
      setSelectedProperty(null)
      onPropertyCreated()
      setIsunarchiveModalOpen(false)

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

  const confirmDelete = async () => {
    if (!selectedProperty) return

    try {
      const response = await apiClient.delete('/dashboard/properties/delete', {
        data: [
          {
            itemId: Number.parseInt(selectedProperty.id),
          },
        ],
      })
      setSelectedProperty(null)
      onPropertyCreated()
      setIsDeleteModalOpen(false)

      const successMessage =
        response.data?.message || 'Property deleted successfully'
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete property. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleBulkUnarchive = async () => {
    if (selectedProperties.length === 0) return

    try {
      const archivePayload = selectedProperties.map((id) => ({
        itemId: Number.parseInt(id),
      }))
      console.log(archivePayload)

      const response = await apiClient.put(
        '/dashboard/properties/archive',
        archivePayload
      )
      setSelectedProperties([])
      onPropertyCreated()
      setIsBulkunarchiveModalOpen(false)
      const successMessage =
        response.data?.message ||
        `${selectedProperties.length} properties archived successfully`
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to archive properties. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return

    try {
      const archivePayload = selectedProperties.map((id) => ({
        itemId: Number.parseInt(id),
      }))

      const response = await apiClient.delete('/dashboard/properties/delete', {
        data: archivePayload,
      })

      setSelectedProperties([])
      onPropertyCreated()
      setIsBulkDeleteModalOpen(false)

      const successMessage =
        response.data?.message ||
        `${selectedProperties.length} properties deleted successfully`
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete properties. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Archived Properties
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ArchiveToggle />
          <PropertiesFilterButton onFilterSelect={handleFilterSelect} />
          <PropertiesSortButton onSortChange={handleSortChange} />
          <ArchiveActionsButton
            onActionSelect={handleActionSelect}
            selectedCount={selectedProperties.length}
          />
        </div>
      </div>

      <div>
        <div className="mt-5 rounded-lg bg-white p-6">
          <ArchivedPropertiesListView
            properties={sortedAndFilteredProperties}
            selectedPropertyId={selectedProperty?.id}
            selectedProperties={selectedProperties}
            onSelectAll={handleSelectAll}
            onToggleSelect={handleToggleSelect}
            selectAllState={getSelectAllState()}
            onUnarchiveClick={handleUnarchiveClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      <ScrollToTop />

      <PropertiesFilterModel
        properties={allProperties}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false)
        }}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />

      <UnarchivePropertyModal
        isOpen={isunarchiveModalOpen}
        onCancel={() => setIsunarchiveModalOpen(false)}
        onConfirm={confirmUnarchive}
      />

      <BulkUnarchivePropertyModal
        isOpen={isBulkunarchiveModalOpen}
        onConfirm={() => {
          handleBulkUnarchive()
        }}
        onCancel={() => setIsBulkunarchiveModalOpen(false)}
        selectedCount={selectedProperties.length}
      />

      <DeletePropertyModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <BulkDeletePropertyModal
        isOpen={isBulkDeleteModalOpen}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
        selectedCount={selectedProperties.length}
        onConfirm={() => {
          handleBulkDelete()
        }}
      />
    </div>
  )
}

export default ArchivedPropertiesViewer
