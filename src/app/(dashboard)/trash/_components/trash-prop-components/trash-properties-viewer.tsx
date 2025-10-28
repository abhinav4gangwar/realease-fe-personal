'use client'
import ScrollToTop from '@/app/(dashboard)/documents/_components/scroll-to-top'
import { PropertiesSortButton } from '@/app/(dashboard)/properties/_components/properties-sort-button'
import { PropertiesViewerProps } from '@/app/(dashboard)/properties/_components/properties-viewer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isBulkRestoreModalOpen, setIsBulkRestoreModalOpen] = useState(false)

  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

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

  const handleDeleteClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsDeleteModalOpen(true)
  }

  const handleRestoreClick = (property: Properties) => {
    setSelectedProperty(property)
    setIsRestoreModalOpen(true)
  }

  const handleActionSelect = (actionType: string) => {
    switch (actionType) {
      case 'delete':
        if (selectedProperties.length > 0) {
          setIsBulkDeleteModalOpen(true)
        }
        break
      case 'restore':
        if (selectedProperties.length > 0) {
          setIsBulkRestoreModalOpen(true)
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
      const response = await apiClient.delete(
        '/dashboard/bin/delete/properties',
        {
          data: [
            {
              itemId: Number.parseInt(selectedProperty.id),
            },
          ],
        }
      )
      setSelectedProperty(null)
      onPropertyCreated()
      setIsDeleteModalOpen(false)

      const successMessage =
        response.data?.message || 'Property permanently deleted successfully'
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete property. Please try again.'
      toast.error(errorMessage)
    }
  }

  const confirmRestore = async () => {
    if (!selectedProperty) return

    try {
      const response = await apiClient.post(
        '/dashboard/bin/restore/properties',
        {
          data: [
            {
              itemId: Number.parseInt(selectedProperty.id),
            },
          ],
        }
      )
      setSelectedProperty(null)
      onPropertyCreated()
      setIsRestoreModalOpen(false)

      const successMessage =
        response.data?.message || 'Property restored successfully'
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to restore property. Please try again.'
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
      const deletePayload = selectedProperties.map((id) => ({
        itemId: Number.parseInt(id),
      }))

      const response = await apiClient.delete(
        '/dashboard/bin/delete/properties',
        {
          data: deletePayload,
        }
      )

      setSelectedProperties([])
      onPropertyCreated()
      setIsBulkDeleteModalOpen(false)

      const successMessage =
        response.data?.message ||
        `${selectedProperties.length} properties permanently deleted successfully`
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete properties. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleBulkRestore = async () => {
    if (selectedProperties.length === 0) return

    try {
      const restorePayload = selectedProperties.map((id) => ({
        itemId: Number.parseInt(id),
      }))

      const response = await apiClient.post(
        '/dashboard/bin/restore/properties',
        {
          data: restorePayload,
        }
      )

      setSelectedProperties([])
      onPropertyCreated()
      setIsBulkRestoreModalOpen(false)

      const successMessage =
        response.data?.message ||
        `${selectedProperties.length} properties restored successfully`
      toast.success(successMessage)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to restore properties. Please try again.'
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
            onDeleteClick={handleDeleteClick}
            onRestoreClick={handleRestoreClick}
          />
        </div>
      </div>

      {/* Single Property Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="border-gray-400">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property and all related documents from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-primary">
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
      >
        <AlertDialogContent className="border-gray-400">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {selectedProperties.length}{' '}
              {selectedProperties.length === 1 ? 'property' : 'properties'}
              and all related documents from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-primary"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Property Restore Confirmation Dialog */}
      <AlertDialog
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
      >
        <AlertDialogContent className="border-gray-400">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this property? It will be moved
              back to your active properties list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-primary">
              Yes, Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Confirmation Dialog */}
      <AlertDialog
        open={isBulkRestoreModalOpen}
        onOpenChange={setIsBulkRestoreModalOpen}
      >
        <AlertDialogContent className="border-gray-400">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Properties</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore {selectedProperties.length}{' '}
              {selectedProperties.length === 1 ? 'property' : 'properties'}?
              They will be moved back to your active properties list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRestore}
              className="bg-primary"
            >
              Yes, Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollToTop />
    </div>
  )
}

export default TrashPropertiesViewer
