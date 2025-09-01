'use client'

import {
    BreadcrumbItem,
    Document,
    FilterState,
    FilterType,
    SortField,
    SortOrder,
    ViewMode,
} from '@/types/document.types'
import { getFileTypeFromMime } from '@/utils/fileTypeUtils'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BreadcrumbNavigation } from '../_components/breadcrumb-navigation'
import { DocumentViewerProps } from '../_components/document-viewer'
import { FilterButton } from '../_components/filter-button'
import { FilterModal } from '../_components/filter-modal'
import ScrollToTop from '../_components/scroll-to-top'
import { SortButton } from '../_components/sort-button'
import { ViewModeToggle } from '../_components/viewmode-toggle'
import {
    findFolderById,
    getFileCounts,
    getFolderCounts,
    handleDownloadClick,
} from '../doc_utils'
import MobileDocumentDetailsModel from './mobile-docuement-detail-model'
import MobileDocumentGridView from './mobile-document-grid-view'
import MobileDocumentListView from './mobile-document-list-view'

const UnifiedDocumentViewer = dynamic(
  () =>
    import('../_components/unified-document-viewer').then(
      (mod) => mod.UnifiedDocumentViewer
    ),
  {
    ssr: false,
  }
)

const MobileDocumentViewer = ({
  recentlyAccessed,
  allFiles,
  apiClient,
  transformApiResponse,
}: DocumentViewerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('dateAdded')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

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
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const [openModalInEditMode, setOpenModalInEditMode] = useState(false)

  const [documentsState, setDocumentsState] = useState<Document[]>(allFiles)
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set())

  const itemsPerPage = 15

  const handleDocumentInfo = (document: Document) => {
    setSelectedDocument(document)
    setOpenModalInEditMode(false)
    setIsModalOpen(true)
  }

  const handleDocumentPreview = (document: Document) => {
    if (document.isFolder) {
      // For folders, use the existing folder click logic
      handleFolderClick(document)
    } else {
      // For files, open the PDF preview modal
      setSelectedDocument(document)
      setIsPdfPreviewOpen(true)
    }
  }

  const handleDocumentRename = async (documentId: string, newName: string) => {
    try {
      await apiClient.put('/dashboard/documents/rename', {
        itemId: Number.parseInt(documentId),
        newName: newName,
      })
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
      if (selectedDocument?.id === documentId) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, name: newName } : null
        )
      }
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

  const handleFileEdit = async (
    documentId: string,
    data: { name: string; propertyId: string; tags: string[] }
  ) => {
    try {
      await apiClient.put(`/dashboard/documents/edit/${documentId}`, {
        name: data.name,
        propertyId: Number.parseInt(data.propertyId),
        tags: data.tags,
      })

      const updateDocumentInArray = (docs: Document[]): Document[] => {
        return docs.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              name: data.name,
              linkedProperty:
                data.propertyId === '0' ? 'Test Property' : data.propertyId,
              tags: data.tags.join(', '),
            }
          }
          if (doc.children) {
            return { ...doc, children: updateDocumentInArray(doc.children) }
          }
          return doc
        })
      }

      setDocumentsState((prevDocs) => updateDocumentInArray(prevDocs))
      if (selectedDocument?.id === documentId) {
        setSelectedDocument((prev) =>
          prev
            ? {
                ...prev,
                name: data.name,
                linkedProperty:
                  data.propertyId === '0' ? 'Test Property' : data.propertyId,
                tags: data.tags.join(', '),
              }
            : null
        )
      }
      if (currentFolder?.id === documentId) {
        setCurrentFolder((prev) =>
          prev
            ? {
                ...prev,
                name: data.name,
                linkedProperty:
                  data.propertyId === '0' ? 'Test Property' : data.propertyId,
                tags: data.tags.join(', '),
              }
            : null
        )
      }
      console.log('Document updated successfully')
    } catch (error: any) {
      console.error('Error updating document:', error)
      const errorMessage = 'Failed to update document. Please try again.'
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
      return documents.filter((doc) => {
        const friendlyType = doc.isFolder
          ? 'Folder'
          : getFileTypeFromMime(doc.fileType, doc.name)

        return filterState.selectedTypes.includes(friendlyType)
      })
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
          // Use friendly file type for grouping
          const key = doc.isFolder
            ? 'Folder'
            : getFileTypeFromMime(doc.fileType, doc.name)

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

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    )
  }

  useEffect(() => {
    setDocumentsState(allFiles)
  }, [allFiles])

  return (
    <div>
      <div className="flex flex-col space-y-4 pb-4">
        <div className="text-secondary text-3xl font-semibold">Documents</div>
        <div className="flex items-center gap-4">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          <FilterButton onFilterSelect={handleFilterSelect} />
          <SortButton onSortChange={handleSortChange} />
          {isSelectMode && selectedDocuments.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedDocuments.length} selected
            </div>
          )}
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
                  className={`${viewMode === 'list' ? 'mt-5 rounded-lg bg-white p-6' : 'mt-4'} mb-16`}
                >
                  {viewMode === 'list' ? (
                    <div>
                      <MobileDocumentListView
                        documents={paginatedDocuments}
                        onDocumentInfo={handleDocumentInfo}
                        onDocumentPreview={handleDocumentPreview}
                        onFolderClick={handleFolderClick}
                        selectedDocumentId={selectedDocument?.id}
                        isShareMode={isSelectMode}
                        onDocumentSelect={handleDocumentSelect}
                        loadingFolders={loadingFolders}
                      />
                    </div>
                  ) : (
                    <div>
                      <MobileDocumentGridView
                        documents={paginatedDocuments}
                        onDocumentInfo={handleDocumentInfo}
                        onDocumentPreview={handleDocumentPreview}
                        onFolderClick={handleFolderClick}
                        selectedDocumentId={selectedDocument?.id}
                        isShareMode={isSelectMode}
                        onDocumentSelect={handleDocumentSelect}
                        loadingFolders={loadingFolders}
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

        <UnifiedDocumentViewer
          document={selectedDocument}
          isOpen={isPdfPreviewOpen}
          onClose={() => {
            setIsPdfPreviewOpen(false)
            if (!isModalOpen) {
              setSelectedDocument(null)
            }
          }}
          apiClient={apiClient}
          onDownloadClick={handleDownloadClick}
        />

        <MobileDocumentDetailsModel
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setOpenModalInEditMode(false)
            setSelectedDocument(null)
          }}
          openInEditMode={openModalInEditMode}
          onSave={handleDocumentRename}
          onEditFile={handleFileEdit}
          onDownloadClick={handleDownloadClick}
        />
      </div>
    </div>
  )
}

export default MobileDocumentViewer
