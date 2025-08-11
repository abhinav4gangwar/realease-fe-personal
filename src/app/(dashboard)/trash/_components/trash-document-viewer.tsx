'use client'

import {
  BreadcrumbItem,
  Document,
  FilterState,
  SortField,
  SortOrder,
  ViewMode,
} from '@/types/document.types'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BreadcrumbNavigation } from '../../documents/_components/breadcrumb-navigation'
import ScrollToTop from '../../documents/_components/scroll-to-top'
import {
  findFolderById,
  getFileCounts,
  getFolderCounts,
} from '../../documents/doc_utils'
import {
  BulkDocumentPermanentDeleteModal,
  DocumentPermanentDeleteModal,
} from './document-permanent-delete-model'
import {
  BulkRestoreModal,
  DocumentRestoreModal,
} from './document-restore-model'
import { SortButton } from './sort-button'
import TrashGridView from './trash-grid-view'
import TrashListView from './trash-list-view'
import { TrashActionsButton } from './TrashActionsButton'
import { ViewModeToggle } from './view-mode-toggle'

interface DocumentViewerProps {
  recentlyAccessed?: Document[]
  allFiles: Document[]
  apiClient: any
  transformApiResponse: (apiData: any) => Document[]
}

export function TrashDocumentViewer({
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

  const [allFilesPage, setAllFilesPage] = useState(1)
  const [filterState, setFilterState] = useState<FilterState>({
    type: 'none',
    selectedProperties: [],
    selectedTypes: [],
  })

  const [currentFolder, setCurrentFolder] = useState<Document | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: 'Documents' },
  ])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const [documentsState, setDocumentsState] = useState<Document[]>(allFiles)
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set())
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openRestoreModal, setOpenRestoreModal] = useState(false)
  const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false)
  const [openBulkRestoreModal, setOpenBulkRestoreModal] = useState(false)

  const itemsPerPage = 15

  const fetchFolderContents = async (folderId: string) => {
    try {
      setLoadingFolders((prev) => new Set(prev).add(folderId))
      const response = await apiClient.get(
        `/dashboard/bin/list/documents?parentId=${folderId}`
      )
      const folderContents = transformApiResponse(response.data)
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
      setBreadcrumbs((prev) => prev.slice(0, index + 1))
      const targetBreadcrumb = breadcrumbs[index]
      if (targetBreadcrumb.id) {
        const targetFolder = findFolderById(targetBreadcrumb.id, documentsState)
        if (targetFolder) {
          setCurrentFolder(targetFolder)
        }
      }
    }
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
      let comparison = 0
      if (sortField === 'dateAdded') {
        const dateA = new Date(a.dateAdded)
        const dateB = new Date(b.dateAdded)
        comparison = dateA.getTime() - dateB.getTime()
      } else {
        const aValue = a[sortField]
        const bValue = b[sortField]
        comparison = aValue.localeCompare(bValue)
      }
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison
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
        .sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        )
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

  const currentDocuments = currentFolder
    ? currentFolder.children || []
    : documentsState
  const processedAllFiles = useMemo(() => {
    const filtered = filterDocuments(currentDocuments)
    const sorted = sortDocuments(filtered)
    return groupDocuments(sorted)
  }, [currentDocuments, filterState, sortField, sortOrder])

  const handleActionSelect = (actionType: string) => {
    switch (actionType) {
      case 'select':
        setIsSelectMode(!isSelectMode)
        if (isSelectMode) {
          setSelectedDocuments([])
        } else {
          setViewMode('list')
        }
        break
      case 'delete':
        if (selectedDocuments.length > 0) {
          setOpenBulkDeleteModal(true)
        }
        break
      case 'restore':
        if (selectedDocuments.length > 0) {
          setOpenBulkRestoreModal(true)
        }
        break
    }
  }

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSelectAll = () => {
    const allDocumentIds = Object.values(processedAllFiles)
      .flat()
      .map((doc) => doc.id)
    if (selectedDocuments.length === allDocumentIds.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(allDocumentIds)
    }
  }

  const getSelectAllState = () => {
    const allDocumentIds = Object.values(processedAllFiles)
      .flat()
      .map((doc) => doc.id)
    if (selectedDocuments.length === 0) {
      return 'none'
    } else if (selectedDocuments.length === allDocumentIds.length) {
      return 'all'
    } else {
      return 'some'
    }
  }

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document)
    setOpenDeleteModal(true)
  }

  const handleRestoreClick = (document: Document) => {
    setSelectedDocument(document)
    setOpenRestoreModal(true)
  }

  useEffect(() => {
    setDocumentsState(allFiles)
  }, [allFiles])

  const resetSelectMode = () => {
    setIsSelectMode(false)
    setSelectedDocuments([])
  }

  const confirmRestore = async () => {
    if (!selectedDocument) return
    try {
      const response = await apiClient.post(
        '/dashboard/bin/restore/documents',
        {
          data: [
            {
              itemId: Number.parseInt(selectedDocument.id),
            },
          ],
        }
      )
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
      if (currentFolder) {
        const updatedChildren =
          currentFolder.children?.filter(
            (child) => child.id !== selectedDocument.id
          ) || []
        const updatedFolder = { ...currentFolder, children: updatedChildren }
        setCurrentFolder(updatedFolder)
      }

      setOpenRestoreModal(false)
      setSelectedDocument(null)
      const successMessage =
        response.data?.message || 'Document restored successfully'
      toast.success(successMessage)
    } catch (error: any) {
      console.error('Error restoring document:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to restore document. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleBulkRestore = async () => {
    if (selectedDocuments.length === 0) return
    try {
      const restorePayload = selectedDocuments.map((id) => ({
        itemId: Number.parseInt(id),
      }))
      const response = await apiClient.post(
        '/dashboard/bin/restore/documents',
        {
          data: restorePayload,
        }
      )
      const removeDocumentsFromArray = (docs: Document[]): Document[] => {
        return docs.filter((doc) => {
          if (selectedDocuments.includes(doc.id)) {
            return false
          }
          if (doc.children) {
            doc.children = removeDocumentsFromArray(doc.children)
          }
          return true
        })
      }

      setDocumentsState((prevDocs) => removeDocumentsFromArray(prevDocs))
      if (currentFolder) {
        const updatedChildren =
          currentFolder.children?.filter(
            (child) => !selectedDocuments.includes(child.id)
          ) || []
        const updatedFolder = { ...currentFolder, children: updatedChildren }
        setCurrentFolder(updatedFolder)
      }

      setOpenBulkRestoreModal(false)
      resetSelectMode()

      const successMessage =
        response.data?.message ||
        `${selectedDocuments.length} documents restored successfully`
      toast.success(successMessage)
    } catch (error: any) {
      console.error('Error restoring documents:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to restore documents. Please try again.'
      toast.error(errorMessage)
    }
  }

  const confirmDelete = async () => {
    if (!selectedDocument) return
    try {
      const response = await apiClient.delete(
        '/dashboard/bin/delete/documents',
        {
          data: [
            {
              itemId: Number.parseInt(selectedDocument.id),
            },
          ],
        }
      )
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

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return
    try {
      const deletePayload = selectedDocuments.map((id) => ({
        itemId: Number.parseInt(id),
      }))
      const response = await apiClient.delete(
        '/dashboard/bin/delete/documents',
        {
          data: deletePayload,
        }
      )
      const removeDocumentsFromArray = (docs: Document[]): Document[] => {
        return docs.filter((doc) => {
          if (selectedDocuments.includes(doc.id)) {
            return false
          }
          if (doc.children) {
            doc.children = removeDocumentsFromArray(doc.children)
          }
          return true
        })
      }

      setDocumentsState((prevDocs) => removeDocumentsFromArray(prevDocs))
      if (currentFolder) {
        const updatedChildren =
          currentFolder.children?.filter(
            (child) => !selectedDocuments.includes(child.id)
          ) || []
        const updatedFolder = { ...currentFolder, children: updatedChildren }
        setCurrentFolder(updatedFolder)
      }

      setOpenBulkDeleteModal(false)
      resetSelectMode()

      const successMessage =
        response.data?.message ||
        `${selectedDocuments.length} documents deleted successfully`
      toast.success(successMessage)
    } catch (error: any) {
      console.error('Error deleting documents:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete documents. Please try again.'
      toast.error(errorMessage)
    }
  }

  return (
    <div
      className={`transition-all duration-300 ${isModalOpen ? 'mr-[343px]' : ''}`}
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
          <SortButton onSortChange={handleSortChange} />
          <TrashActionsButton
            onActionSelect={handleActionSelect}
            isSelectMode={isSelectMode}
            selectedCount={selectedDocuments.length}
          />
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
                    <TrashListView
                      documents={paginatedDocuments}
                      onFolderClick={handleFolderClick}
                      selectedDocumentId={selectedDocument?.id}
                      selectedDocuments={selectedDocuments}
                      onDocumentSelect={handleDocumentSelect}
                      loadingFolders={loadingFolders}
                      onSelectAll={handleSelectAll}
                      selectAllState={getSelectAllState()}
                      onRestoreClick={handleRestoreClick}
                      onDeleteClick={handleDeleteClick}
                    />
                  ) : (
                    <div>
                      <TrashGridView
                        documents={paginatedDocuments}
                        onFolderClick={handleFolderClick}
                        selectedDocumentId={selectedDocument?.id}
                        selectedDocuments={selectedDocuments}
                        onDocumentSelect={handleDocumentSelect}
                        loadingFolders={loadingFolders}
                        onSelectAll={handleSelectAll}
                        onRestoreClick={handleRestoreClick}
                        onDeleteClick={handleDeleteClick}
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
        <ScrollToTop />

        <DocumentRestoreModal
          isOpen={openRestoreModal}
          onConfirm={confirmRestore}
          onCancel={() => {
            setOpenRestoreModal(false)
            setSelectedDocument(null)
          }}
        />

        <BulkRestoreModal
          isOpen={openBulkRestoreModal}
          onConfirm={handleBulkRestore}
          onCancel={() => {
            setOpenBulkRestoreModal(false)
          }}
          selectedCount={selectedDocuments.length}
        />

        <DocumentPermanentDeleteModal
          isOpen={openDeleteModal}
          onConfirm={confirmDelete}
          onCancel={() => {
            setOpenDeleteModal(false)
            setSelectedDocument(null)
          }}
        />

        <BulkDocumentPermanentDeleteModal
          isOpen={openBulkDeleteModal}
          onConfirm={handleBulkDelete}
          onCancel={() => {
            setOpenBulkDeleteModal(false)
          }}
          selectedCount={selectedDocuments.length}
        />
      </div>
    </div>
  )
}
