'use client'

import { Button } from '@/components/ui/button'
import type {
  BreadcrumbItem,
  Document,
  FilterState,
  FilterType,
  SortField,
  SortOrder,
  ViewMode,
} from '@/types/document.types'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ActionsButton } from './actions-button'
import { AddButton, type addType } from './add-button'
import { BreadcrumbNavigation } from './breadcrumb-navigation'
import { CancelShareModal } from './cancel-share-modal'
import DocumentDeleteModal from './document-delete-modal'
import { DocumentDetailModal } from './document-detail-modal'
import { DocumentGridView } from './document-grid-view'
import { DocumentListView } from './document-list-view'
import { FilterButton } from './filter-button'
import { FilterModal } from './filter-modal'
import { MoveDocumentModal } from './move-document-modal'
import { ScrollToTopButton } from './scroll-to-top-button'
import { SelectedDocsModal } from './selected-docs-modal'
import { ShareEmailModal } from './share-email-modal'
import { SortButton } from './sort-button'
import { UploadModal } from './upload-modal'
import { ViewModeToggle } from './viewmode-toggle'

interface DocumentViewerProps {
  recentlyAccessed?: Document[]
  allFiles: Document[]
  apiClient: any
  transformApiResponse: (apiData: any) => Document[]
}

export function DocumentViewer({
  recentlyAccessed,
  allFiles,
  apiClient,
  transformApiResponse,
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
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [addModalType, setAddModaltype] = useState<
    'uploadFile' | 'createFolder'
  >('uploadFile')
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
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [isShareEmailModalOpen, setIsShareEmailModalOpen] = useState(false)
  const [isCancelShareModalOpen, setIsCancelShareModalOpen] = useState(false)
  const [isSelectedDocsModalOpen, setIsSelectedDocsModalOpen] = useState(false)
  const [openModalInEditMode, setOpenModalInEditMode] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [documentsState, setDocumentsState] = useState<Document[]>(allFiles)
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set())

  const itemsPerPage = 15

  const handleDocumentInfo = (document: Document) => {
    setSelectedDocument(document)
    setOpenModalInEditMode(false)
    setIsModalOpen(true)
  }

  const handleDocumentRename = async (documentId: string, newName: string) => {
    try {
      await apiClient.put('/dashboard/documents/rename', {
        itemId: Number.parseInt(documentId),
        newName: newName,
      })
      // Update the document in the state
      const updateDocumentInArray = (docs: Document[]): Document[] => {
        return docs.map((doc) => {
          if (doc.id === documentId) {
            return { ...doc, name: newName }
          }
          if (doc.children) {
            return { ...doc, children: updateDocumentInArray(doc.children) }
          }
          return doc
        })
      }

      setDocumentsState((prevDocs) => updateDocumentInArray(prevDocs))

      // Update the selected document if it's the one being renamed
      if (selectedDocument?.id === documentId) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, name: newName } : null
        )
      }

      // Update current folder if it's the one being renamed
      if (currentFolder?.id === documentId) {
        setCurrentFolder((prev) => (prev ? { ...prev, name: newName } : null))
      }

      console.log('Document renamed successfully')
    } catch (error: any) {
      console.error('Error renaming document:', error)
      const errorMessage = 'Failed to rename document. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const fetchFolderContents = async (folderId: string) => {
    try {
      setLoadingFolders((prev) => new Set(prev).add(folderId))
      const response = await apiClient.get(
        `/dashboard/documents/list?parentId=${folderId}`
      )
      const folderContents = transformApiResponse(response.data)

      // Update the folder's children in the documents state
      setDocumentsState((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === folderId ? { ...doc, children: folderContents } : doc
        )
      )

      return folderContents
    } catch (error) {
      console.error('Error fetching folder contents:', error)
      return []
    } finally {
      setLoadingFolders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(folderId)
        return newSet
      })
    }
  }

  const handleFolderClick = async (folder: Document) => {
    // If folder doesn't have children loaded, fetch them
    if (!folder.children || folder.children.length === 0) {
      const folderContents = await fetchFolderContents(folder.id)
      const updatedFolder = { ...folder, children: folderContents }
      setCurrentFolder(updatedFolder)
    } else {
      setCurrentFolder(folder)
    }

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
      // Find the folder to navigate to based on breadcrumb
      const targetBreadcrumb = breadcrumbs[index]
      if (targetBreadcrumb.id) {
        const targetFolder = findFolderById(targetBreadcrumb.id, documentsState)
        if (targetFolder) {
          setCurrentFolder(targetFolder)
        }
      }
    }
  }

  const findFolderById = (
    folderId: string,
    documents: Document[]
  ): Document | null => {
    for (const doc of documents) {
      if (doc.id === folderId) {
        return doc
      }
      if (doc.children) {
        const found = findFolderById(folderId, doc.children)
        if (found) return found
      }
    }
    return null
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

  const handleMoveClick = (document: Document) => {
    setDocumentToMove(document)
    setIsMoveModalOpen(true)
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

  // Use documentsState instead of allFiles for current documents
  const currentDocuments = currentFolder
    ? currentFolder.children || []
    : documentsState

  const processedAllFiles = useMemo(() => {
    const filtered = filterDocuments(currentDocuments)
    const sorted = sortDocuments(filtered)
    return groupDocuments(sorted)
  }, [currentDocuments, filterState, sortField, sortOrder])

  const handleAddSelect = (addType: addType) => {
    setAddModaltype(addType)
    setUploadModalOpen(true)
  }

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

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document)
    setOpenDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedDocument) return

    try {
      const response = await apiClient.delete('/dashboard/documents/delete', {
        data: {
          itemId: Number.parseInt(selectedDocument.id),
        },
      })

      // Remove the document from the state
      const removeDocumentFromArray = (docs: Document[]): Document[] => {
        return docs.filter((doc) => {
          if (doc.id === selectedDocument.id) {
            return false
          }
          if (doc.children) {
            doc.children = removeDocumentFromArray(doc.children)
          }
          return true
        })
      }

      setDocumentsState((prevDocs) => removeDocumentFromArray(prevDocs))

      // Update current folder if we're inside one
      if (currentFolder) {
        const updatedChildren =
          currentFolder.children?.filter(
            (child) => child.id !== selectedDocument.id
          ) || []
        const updatedFolder = { ...currentFolder, children: updatedChildren }
        setCurrentFolder(updatedFolder)
      }

      setOpenDeleteModal(false)
      setSelectedDocument(null)

      const successMessage =
        response.data?.message || 'Document deleted successfully'
      toast.success(successMessage)
    } catch (error: any) {
      console.error('Error deleting document:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete document. Please try again.'
      toast.error(errorMessage)
    }
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
    const allDocs = [...documentsState] //have to add recently accessed
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

  // Update documentsState when allFiles prop changes
  useEffect(() => {
    setDocumentsState(allFiles)
  }, [allFiles])

  const handleUploadSuccess = async () => {
    try {
      const response = await apiClient.get('/dashboard/documents/list')
      const updatedDocuments = transformApiResponse(response.data)
      setDocumentsState(updatedDocuments)

      if (currentFolder) {
        const folderResponse = await apiClient.get(
          `/dashboard/documents/list?parentId=${currentFolder.id}`
        )
        const folderContents = transformApiResponse(folderResponse.data)
        const updatedFolder = { ...currentFolder, children: folderContents }
        setCurrentFolder(updatedFolder)

        setDocumentsState((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === currentFolder.id ? updatedFolder : doc
          )
        )
      }

      toast.success('Documents updated successfully')
    } catch (error) {
      console.error('Error refreshing documents:', error)
      toast.error('Failed to refresh documents')
    }
  }

  const getAllFolders = (documents: Document[]) => {
    const folders: Document[] = []

    const extractFolders = (docs: Document[]) => {
      docs.forEach((doc) => {
        if (doc.isFolder) {
          folders.push(doc)
          if (doc.children) {
            extractFolders(doc.children)
          }
        }
      })
    }
    extractFolders(documents)
    return folders
  }

  const handleMoveDocument = async (
    documentId: string,
    newParentId: string | null
  ) => {
    try {
      await apiClient.put('/dashboard/documents/move', {
        itemId: Number.parseInt(documentId),
        newParentId: newParentId ? Number.parseInt(newParentId) : null,
      })
      await handleUploadSuccess()

      toast.success('Document moved successfully')
    } catch (error: any) {
      console.error('Error moving document:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to move document. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

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
              variant="outline"
              className={`hover:bg-secondary } flex h-11 cursor-pointer items-center space-x-1 font-semibold hover:text-white`}
              onClick={handleConfirmShare}
              disabled={selectedDocuments.length === 0}
            >
              Confirm
            </Button>
          ) : (
            <Button
              variant="outline"
              className={`hover:bg-secondary } flex h-11 cursor-pointer items-center space-x-1 font-semibold hover:text-white`}
              onClick={handleShareDocsClick}
            >
              Share Docs
            </Button>
          )}
          <ActionsButton onActionSelect={() => {}} />
          <AddButton onAddSelect={handleAddSelect} />
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
                      loadingFolders={loadingFolders}
                      onDeleteClick={handleDeleteClick}
                      onMoveClick={handleMoveClick}
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
                        loadingFolders={loadingFolders}
                        onDeleteClick={handleDeleteClick}
                        onMoveClick={handleMoveClick}
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
          onSave={handleDocumentRename}
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

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          addType={addModalType}
          onSuccess={handleUploadSuccess}
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

        <DocumentDeleteModal
          isOpen={openDeleteModal}
          onConfirm={confirmDelete}
          onCancel={() => setOpenDeleteModal(false)}
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

        <MoveDocumentModal
          isOpen={isMoveModalOpen}
          onClose={() => {
            setIsMoveModalOpen(false)
            setDocumentToMove(null)
          }}
          document={documentToMove}
          availableFolders={getAllFolders(documentsState)}
          onMove={handleMoveDocument}
        />
      </div>
    </div>
  )
}
