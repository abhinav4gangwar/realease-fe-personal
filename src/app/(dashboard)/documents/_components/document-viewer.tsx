'use client'
import { Button } from '@/components/ui/button'
import { QUICK_ACTIONS_DOCS } from '@/lib/constants'
import {
  BreadcrumbItem,
  Document,
  FilterState,
  FilterType,
  SortField,
  SortOrder,
  ViewMode,
} from '@/types/document.types'
import { useMemo, useState } from 'react'
import QuickActionMenu from '../../_components/quick-action-menu'
import { BreadcrumbNavigation } from './breadcrumb-navigation'
import { CancelShareModal } from './cancel-share-modal'
import { DocumentDetailModal } from './document-detail-modal'
import { DocumentGridView } from './document-grid-view'
import { DocumentListView } from './document-list-view'
import { FilterButton } from './filter-button'
import { FilterModal } from './filter-modal'
import { ScrollToTopButton } from './scroll-to-top-button'
import { SelectedDocsModal } from './selected-docs-modal'
import { ShareEmailModal } from './share-email-modal'
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
  const [currentFolder, setCurrentFolder] = useState<Document | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: 'Documents' },
  ])
  const [isShareMode, setIsShareMode] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isShareEmailModalOpen, setIsShareEmailModalOpen] = useState(false)
  const [isCancelShareModalOpen, setIsCancelShareModalOpen] = useState(false)
  const [isSelectedDocsModalOpen, setIsSelectedDocsModalOpen] = useState(false)
  const [openModalInEditMode, setOpenModalInEditMode] = useState(false)

  const itemsPerPage = 15

  const handleDocumentInfo = (document: Document) => {
    setSelectedDocument(document)
    setOpenModalInEditMode(false)
    setIsModalOpen(true)
  }

  const handleFolderClick = (folder: Document) => {
    setCurrentFolder(folder)
    setBreadcrumbs((prev) => [
      ...prev,
      { name: `${folder.name} (${getFolderCounts(folder)})`, id: folder.id },
    ])
  }

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === 0) {
      setCurrentFolder(null)
      setBreadcrumbs([{ name: 'Documents' }])
    } else {
      // Navigate to specific folder level
      setBreadcrumbs((prev) => prev.slice(0, index + 1))
    }
  }

  const getFolderCounts = (folder: Document) => {
    if (!folder.children) return '0 Files'
    const folders = folder.children.filter((child) => child.isFolder).length
    const files = folder.children.filter((child) => !child.isFolder).length
    return `${folders} Folders & ${files} Files`
  }

  const getFileCounts = (documents: Document[]) => {
    const folders = documents.filter((doc) => doc.isFolder).length
    const files = documents.filter((doc) => !doc.isFolder).length
    return `${folders} Folders & ${files} Files`
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
      return { [`Files & Folders (${getFileCounts(documents)})`]: documents }
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

  const currentDocuments = currentFolder
    ? currentFolder.children || []
    : allFiles

  const processedAllFiles = useMemo(() => {
    const filtered = filterDocuments(currentDocuments)
    const sorted = sortDocuments(filtered)
    return groupDocuments(sorted)
  }, [currentDocuments, filterState, sortField, sortOrder])

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

  const handleEditClick = (document: Document) => {
    setSelectedDocument(document)
    setOpenModalInEditMode(true)
    setIsModalOpen(true)
  }

  const handleShareDocsClick = () => {
    setIsShareMode(true)
    setSelectedDocuments([])
    setViewMode('list') // Force list view for sharing
  }

  const handleConfirmShare = () => {
    if (selectedDocuments.length > 0) {
      setIsSelectedDocsModalOpen(true)
    }
  }

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleRemoveSelectedDocument = (documentId: string) => {
    setSelectedDocuments((prev) => prev.filter((id) => id !== documentId))
  }

  const resetShareMode = () => {
    setIsShareMode(false)
    setSelectedDocuments([])
    setIsSelectedDocsModalOpen(false)
    setIsShareEmailModalOpen(false)
    setIsCancelShareModalOpen(false)
  }

  const handleCancelShare = () => {
    if (selectedDocuments.length > 0) {
      setIsCancelShareModalOpen(true)
    } else {
      resetShareMode()
    }
  }

  const confirmCancelShare = () => {
    resetShareMode()
  }

  const handleCancelFromModal = () => {
    setIsSelectedDocsModalOpen(false)
    setIsShareEmailModalOpen(false)
    setIsCancelShareModalOpen(true)
  }

  const handleModalClose = () => {
    setIsSelectedDocsModalOpen(false)
    setIsShareEmailModalOpen(false)
  }

  const getSelectedDocumentObjects = () => {
    const allDocs = [...recentlyAccessed, ...allFiles]
    const allDocsWithChildren: Document[] = []
    allDocs.forEach((doc) => {
      allDocsWithChildren.push(doc)
      if (doc.children) {
        allDocsWithChildren.push(...doc.children)
      }
    })
    return selectedDocuments
      .map((id) => allDocsWithChildren.find((doc) => doc.id === id))
      .filter(Boolean) as Document[]
  }

  const paginatedRecentlyAccessed = processedRecentlyAccessed.slice(
    0,
    recentPage * itemsPerPage
  )
  const hasMoreRecent =
    processedRecentlyAccessed.length > recentPage * itemsPerPage

  return (
    <div
      className={`transition-all duration-300 ${isModalOpen ? 'mr-[350px]' : ''}`}
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
          {isShareMode ? (
            <Button
              className="h-8 bg-green-500 hover:bg-green-600"
              onClick={handleConfirmShare}
              disabled={selectedDocuments.length === 0}
            >
              Confirm
            </Button>
          ) : (
            <Button
              className="h-8 bg-blue-500 hover:bg-blue-600"
              onClick={handleShareDocsClick}
            >
              Share Docs
            </Button>
          )}
          <QuickActionMenu quickActionOptions={QUICK_ACTIONS_DOCS} />
        </div>
      </div>
      {currentFolder && (
        <div className="mb-6">
          <BreadcrumbNavigation
            items={breadcrumbs}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>
      )}
      <div>
        {/* Recently Accessed Section */}
        {!currentFolder && (
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
                  selectedDocumentId={selectedDocument?.id}
                  isShareMode={isShareMode}
                  selectedDocuments={selectedDocuments}
                  onDocumentSelect={handleDocumentSelect}
                  onEditClick={handleEditClick}
                />
              ) : (
                <div>
                  <DocumentGridView
                    documents={paginatedRecentlyAccessed}
                    onDocumentInfo={handleDocumentInfo}
                    selectedDocumentId={selectedDocument?.id}
                    isShareMode={isShareMode}
                    selectedDocuments={selectedDocuments}
                    onDocumentSelect={handleDocumentSelect}
                    onEditClick={handleEditClick}
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
        )}

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
                  {groupName}
                </h2>
                <div
                  className={`${viewMode === 'list' ? 'mt-5 rounded-lg bg-white p-6' : 'mt-4'}`}
                >
                  {viewMode === 'list' ? (
                    <DocumentListView
                      documents={paginatedDocuments}
                      onDocumentInfo={handleDocumentInfo}
                      onFolderClick={handleFolderClick}
                      selectedDocumentId={selectedDocument?.id}
                      isShareMode={isShareMode}
                      selectedDocuments={selectedDocuments}
                      onDocumentSelect={handleDocumentSelect}
                      onEditClick={handleEditClick}
                    />
                  ) : (
                    <div>
                      <DocumentGridView
                        documents={paginatedDocuments}
                        onDocumentInfo={handleDocumentInfo}
                        onFolderClick={handleFolderClick}
                        selectedDocumentId={selectedDocument?.id}
                        isShareMode={isShareMode}
                        selectedDocuments={selectedDocuments}
                        onDocumentSelect={handleDocumentSelect}
                        onEditClick={handleEditClick}
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
        {/* Document Detail Modal */}
        <DocumentDetailModal
         document={selectedDocument}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setOpenModalInEditMode(false)
            setSelectedDocument(null)
          }}
          openInEditMode={openModalInEditMode}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filterType={filterModalType}
          documents={currentDocuments}
          selectedItems={
            filterModalType === 'property'
              ? filterState.selectedProperties
              : filterState.selectedTypes
          }
          onApply={handleFilterApply}
        />

        <ScrollToTopButton />

        <ShareEmailModal
          isOpen={isShareEmailModalOpen}
          onClose={handleModalClose}
          selectedDocuments={getSelectedDocumentObjects()}
          onCancel={handleCancelFromModal}
        />

        <CancelShareModal
          isOpen={isCancelShareModalOpen}
          onConfirm={confirmCancelShare}
          onCancel={() => setIsCancelShareModalOpen(false)}
        />

        <SelectedDocsModal
          isOpen={isSelectedDocsModalOpen}
          onClose={handleModalClose}
          selectedDocuments={getSelectedDocumentObjects()}
          onRemoveDocument={handleRemoveSelectedDocument}
          onSelectMore={handleModalClose}
          onShareViaEmail={() => {
            setIsSelectedDocsModalOpen(false)
            setIsShareEmailModalOpen(true)
          }}
          onCancel={handleCancelFromModal}
        />
      </div>
    </div>
  )
}
