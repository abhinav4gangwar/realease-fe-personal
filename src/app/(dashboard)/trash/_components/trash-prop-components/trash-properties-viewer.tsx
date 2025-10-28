'use state'
import ScrollToTop from '@/app/(dashboard)/documents/_components/scroll-to-top'
import { PropertiesSortButton } from '@/app/(dashboard)/properties/_components/properties-sort-button'
import { PropertiesViewerProps } from '@/app/(dashboard)/properties/_components/properties-viewer'
import {
    FilterState,
    Properties,
    PropertySortField,
    PropertySortOrder,
} from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import TrashStateToggleButton from '../trsah-state-toggle'
import { TrashPropertiesActionsButton } from './trash-prop-action-button'
import TrashPropertiesListView from './trash-properties-list-view'

const TrashPropertiesViewer = ({
  allProperties,
  onPropertyCreated,
}: PropertiesViewerProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Properties | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isCreatePropertyModalOpen, setIsCreatePropertyModalOpen] =
    useState(false)
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [OpenBulkArchiveModal, setOpenBulkArchiveModal] = useState(false)

  const [sortField, setSortField] = useState<PropertySortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<PropertySortOrder>('desc')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    owners: [],
    locations: [],
    propertyTypes: [],
    legalStatuses: [],
  })
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [isSharePropertyModalOpen, setIsSharePropertyModalOpen] =
    useState(false)
  const [isIndividualPropertyShare, setIsIndividualPropertyShare] =
    useState(false)

  const getSelectedPropertyObjects = () => {
    return selectedProperties
      .map((id) => sortedAndFilteredProperties.find((prop) => prop.id === id))
      .filter(Boolean) as Properties[]
  }

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSortField(field)
    setSortOrder(order)
  }

  const handleDeleteClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsDeleteModalOpen(true)
  }

  const handleActionSelect = (actionType: string) => {
    switch (actionType) {
      case 'share':
        if (selectedProperties.length > 0) {
          setIsIndividualPropertyShare(false)
          setIsSharePropertyModalOpen(true)
        }
        break
      case 'delete':
        if (selectedProperties.length > 0) {
          setIsBulkDeleteModalOpen(true)
        }
        break
      case 'archive':
        if (selectedProperties.length > 0) {
          setOpenBulkArchiveModal(true)
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

  // sorting logic - memoized to prevent infinite re-renders
  const sortProperties = useCallback(
    (properties: Properties[]) => {
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
            const extentA = parseFloat(
              a.extent?.replace(/[^0-9.-]+/g, '') || '0'
            )
            const extentB = parseFloat(
              b.extent?.replace(/[^0-9.-]+/g, '') || '0'
            )
            const valuePerSQA = parseFloat(
              a.valuePerSQ?.replace(/[^0-9.-]+/g, '') || '0'
            )
            const valuePerSQB = parseFloat(
              b.valuePerSQ?.replace(/[^0-9.-]+/g, '') || '0'
            )

            const totalValueA = extentA * valuePerSQA
            const totalValueB = extentB * valuePerSQB
            comparison = totalValueA - totalValueB
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
    },
    [sortField, sortOrder]
  )

  const sortedAndFilteredProperties = useMemo(() => {
    return sortProperties([...filteredProperties])
  }, [filteredProperties, sortProperties])

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

  useEffect(() => {
    const visibleIds = new Set(sortedAndFilteredProperties.map((p) => p.id))
    setSelectedProperties((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [sortedAndFilteredProperties])

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
            Trash
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TrashStateToggleButton />

          <PropertiesSortButton onSortChange={handleSortChange} />

          <TrashPropertiesActionsButton
            onActionSelect={handleActionSelect}
            selectedCount={selectedProperties.length}
          />
        </div>
      </div>

      <div>
        <div className="mt-5 rounded-lg bg-white p-6">
          <TrashPropertiesListView
            properties={sortedAndFilteredProperties}
            selectedPropertyId={selectedProperty?.id}
            selectedProperties={selectedProperties}
            onSelectAll={handleSelectAll}
            onToggleSelect={handleToggleSelect}
            selectAllState={getSelectAllState()}
          />
        </div>
      </div>

      <ScrollToTop />
    </div>
  )
}

export default TrashPropertiesViewer
