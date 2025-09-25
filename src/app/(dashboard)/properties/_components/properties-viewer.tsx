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
import ScrollToTop from '../../documents/_components/scroll-to-top'
import BulkDeletePropertyModal from '../archived/_components/bulk-delete-model'
import DeletePropertyModal from '../archived/_components/delete-model'
import BulkArchivePropertyModal from './archive-bulk-property-modal'
import ArchivePropertyModal from './archive-property-model'
import ArchiveToggle from './archive-toggle'
import CreatePropertyModal from './create-property-modal'
import { PropertiesActionsButton } from './properties-action-button'
import { PropertiesAddButton } from './properties-add-button'
import PropertiesDetailsModel from './properties-details-model'
import PropertiesEditModel from './properties-edit-model'
import { PropertiesFilterButton } from './properties-filter-button'
import PropertiesFilterModel from './properties-filter-model'
import PropertiesListView from './properties-list-view'
import { PropertiesSortButton } from './properties-sort-button'
import { SharePropertyModal } from './sharePropertyModel'

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

  const handleCreatePropertyClose = () => {
    setIsCreatePropertyModalOpen(false)
    onPropertyCreated()
  }

  const handleShareClick = (property: Properties) => {
    setIsIndividualPropertyShare(true)
    setSelectedProperties([property.id])
    setSelectedProperty(property)
    setIsSharePropertyModalOpen(true)
  }

  const handleShareModalClose = () => {
    if (isIndividualPropertyShare) {
      setSelectedProperties([])
      setSelectedProperty(null)
    }
    setIsSharePropertyModalOpen(false)
    setIsIndividualPropertyShare(false)
  }

  const handleEditPropertyClose = () => {
    onPropertyCreated()
    setIsEditPropertyModalOpen(false)
    setSelectedProperty(null)
    setIsModalOpen(false)
  }

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSortField(field)
    setSortOrder(order)
  }

  const handleAddSelect = () => {
    setIsCreatePropertyModalOpen(true)
  }

  const handleFilterSelect = () => {
    setIsFilterModalOpen(true)
  }

  const handlePropertyInfo = (property: Properties) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsEditPropertyModalOpen(true)
  }

  const handleArchiveClick = (property: Properties) => {
    setIsArchiveModalOpen(true)
    setSelectedProperty(property)
  }

  const handleDownloadClick = (property: Properties) => {
    console.log('Download', property)
  }

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters)
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
      setIsEditPropertyModalOpen(false)
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

  const handleBulkArchive = async () => {
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
      setOpenBulkArchiveModal(false)
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
            Properties
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ArchiveToggle />
          <PropertiesFilterButton onFilterSelect={handleFilterSelect} />
          <PropertiesSortButton onSortChange={handleSortChange} />
          <PropertiesActionsButton
            onActionSelect={handleActionSelect}
            selectedCount={selectedProperties.length}
          />
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
            selectedProperties={selectedProperties}
            onSelectAll={handleSelectAll}
            onToggleSelect={handleToggleSelect}
            selectAllState={getSelectAllState()}
            onArchiveClick={handleArchiveClick}
            onDeleteClick={handleDeleteClick}
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
        onClose={handleEditPropertyClose}
        handleAddAnother={() => {
          setIsEditPropertyModalOpen(false)
          setIsCreatePropertyModalOpen(true)
          setSelectedProperty(null)
        }}
        onArchiveClick={handleArchiveClick}
        setSelectedProperty={setSelectedProperty}
      />

      <PropertiesFilterModel
        properties={allProperties}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false)
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

      <BulkArchivePropertyModal
        isOpen={OpenBulkArchiveModal}
        onConfirm={() => {
          handleBulkArchive()
        }}
        onCancel={() => setOpenBulkArchiveModal(false)}
        selectedCount={selectedProperties.length}
      />

      <SharePropertyModal
        isOpen={isSharePropertyModalOpen}
        onClose={handleShareModalClose}
        selectedProperties={getSelectedPropertyObjects()}
        onCancel={handleShareModalClose}
      />
    </div>
  )
}

export default PropertiesViewer
