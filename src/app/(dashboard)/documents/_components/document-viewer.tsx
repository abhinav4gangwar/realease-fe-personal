'use client'
import { QUICK_ACTIONS_DOCS } from '@/lib/constants'
import {
  Document,
  FilterState,
  FilterType,
  SortField,
  SortOrder,
  ViewMode,
} from '@/types/document.types'
import { useMemo, useState } from 'react'
import QuickActionMenu from '../../_components/quick-action-menu'
import { DocumentGridView } from './document-grid-view'
import { DocumentListView } from './document-list-view'
import { FilterButton } from './filter-button'
import { SortButton } from './sort-button'
import { ViewModeToggle } from './viewmode-toggle'

interface DocumentViewerProps {
  recentlyAccessed: Document[]
  allFiles: Document[]
}

export function DocumentViewer({
  recentlyAccessed,
  allFiles,
}: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [recentPage, setRecentPage] = useState(1)
  const [allFilesPage, setAllFilesPage] = useState(1)
  const [filterState, setFilterState] = useState<FilterState>({
    type: 'none',
    selectedProperties: [],
    selectedTypes: [],
  })
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterModalType, setFilterModalType] = useState<'property' | 'type'>(
    'property'
  )

  const itemsPerPage = 15

  const handleDocumentInfo = (document: Document) => {
    setSelectedDocument(document)
    setIsModalOpen(true)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field)
    setSortOrder(order)
  }

  const sortDocuments = (documents: Document[]) => {
    return documents.sort((a, b) => {
      let aValue: string
      let bValue: string

      if (sortField === 'dateAdded') {
        aValue = a.dateAdded
        bValue = b.dateAdded
      } else {
        aValue = a[sortField]
        bValue = b[sortField]
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  const filterDocuments = (documents: Document[]) => {
    if (filterState.type === 'none') {
      return documents
    }

    if (filterState.type === 'property') {
      return documents.filter((doc) =>
        filterState.selectedProperties.includes(doc.linkedProperty)
      )
    }

    if (filterState.type === 'type') {
      return documents.filter((doc) =>
        filterState.selectedTypes.includes(doc.fileType)
      )
    }

    if (filterState.type === 'recent') {
      return documents
        .slice()
        .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))
    }

    return documents
  }

  const groupDocuments = (documents: Document[]) => {
    if (filterState.type === 'none') {
      return { 'All Files': documents }
    }

    if (filterState.type === 'property') {
      return documents.reduce(
        (groups, doc) => {
          const key = doc.linkedProperty
          if (!groups[key]) groups[key] = []
          groups[key].push(doc)
          return groups
        },
        {} as Record<string, Document[]>
      )
    }

    if (filterState.type === 'type') {
      return documents.reduce(
        (groups, doc) => {
          const key = doc.fileType
          if (!groups[key]) groups[key] = []
          groups[key].push(doc)
          return groups
        },
        {} as Record<string, Document[]>
      )
    }

    return { 'Recently Uploaded': documents }
  }

  const processedRecentlyAccessed = useMemo(() => {
    return sortDocuments([...recentlyAccessed])
  }, [recentlyAccessed, sortField, sortOrder])

  const processedAllFiles = useMemo(() => {
    const filtered = filterDocuments(allFiles)
    const sorted = sortDocuments(filtered)
    return groupDocuments(sorted)
  }, [allFiles, filterState, sortField, sortOrder])

  const handleFilterSelect = (filterType: FilterType) => {
    if (filterType === 'property' || filterType === 'type') {
      setFilterModalType(filterType)
      setIsFilterModalOpen(true)
    } else {
      setFilterState({
        type: filterType,
        selectedProperties: [],
        selectedTypes: [],
      })
      setAllFilesPage(1)
    }
  }

  const handleFilterApply = (selectedItems: string[]) => {
    setFilterState((prev) => ({
      ...prev,
      type: filterModalType,
      selectedProperties: filterModalType === 'property' ? selectedItems : [],
      selectedTypes: filterModalType === 'type' ? selectedItems : [],
    }))
    setAllFilesPage(1)
  }

  const clearFilters = () => {
    setFilterState({
      type: 'none',
      selectedProperties: [],
      selectedTypes: [],
    })
    setAllFilesPage(1)
  }

  const paginatedRecentlyAccessed = processedRecentlyAccessed.slice(
    0,
    recentPage * itemsPerPage
  )
  const hasMoreRecent =
    processedRecentlyAccessed.length > recentPage * itemsPerPage

  return (
    <div
      className={`transition-all duration-300 ${isModalOpen ? 'mr-[400px]' : ''}`}
    >
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Documents
        </div>

        <div className="flex items-center gap-4">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          <FilterButton onFilterSelect={handleFilterSelect} />
          <SortButton onSortChange={handleSortChange} />
          <QuickActionMenu quickActionOptions={QUICK_ACTIONS_DOCS} />
        </div>
      </div>

      <div>
        {/* Recently Accessed Section */}
        <div className="mb-8">
          <h2 className="text-secondary text-lg font-semibold lg:text-xl">
            Recently Accessed
          </h2>
          <div
            className={`${viewMode === 'list' ? 'mt-5 rounded-lg bg-white p-6' : 'mt-6'}`}
          >
            {viewMode === 'list' ? (
              <DocumentListView
                documents={paginatedRecentlyAccessed}
                onDocumentInfo={handleDocumentInfo}
              />
            ) : (
              <div>
                <DocumentGridView
                  documents={paginatedRecentlyAccessed}
                  onDocumentInfo={handleDocumentInfo}
                />
              </div>
            )}
            {hasMoreRecent && (
              <div className="px-4 pt-4">
                <div
                  onClick={() => setAllFilesPage((prev) => prev + 1)}
                  className="hover:text-primary w-full cursor-pointer text-sm font-light text-[#9B9B9D]"
                >
                  View More
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(processedAllFiles).map(([groupName, documents]) => {
            const paginatedDocuments = documents.slice(
              0,
              allFilesPage * itemsPerPage
            )
            const hasMore = documents.length > allFilesPage * itemsPerPage

            return (
              <div key={groupName}>
                <h2 className="text-secondary text-lg font-semibold lg:text-xl">
                  Files
                </h2>
                <div
                  className={`${viewMode === 'list' ? 'mt-5 rounded-lg bg-white p-6' : 'mt-4'}`}
                >
                  {viewMode === 'list' ? (
                    <DocumentListView
                      documents={paginatedDocuments}
                      onDocumentInfo={handleDocumentInfo}
                    />
                  ) : (
                    <div>
                      <DocumentGridView
                        documents={paginatedDocuments}
                        onDocumentInfo={handleDocumentInfo}
                      />
                    </div>
                  )}
                  {hasMore && (
                    <div className="px-4 pt-4">
                      <div
                        onClick={() => setAllFilesPage((prev) => prev + 1)}
                        className="hover:text-primary w-full cursor-pointer text-sm font-light text-[#9B9B9D]"
                      >
                        View More
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
