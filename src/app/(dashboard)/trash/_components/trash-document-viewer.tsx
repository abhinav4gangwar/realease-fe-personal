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
import { BreadcrumbNavigation } from '../../documents/_components/breadcrumb-navigation'
import ScrollToTop from '../../documents/_components/scroll-to-top'
import {
  findFolderById,
  getFileCounts,
  getFolderCounts,
} from '../../documents/doc_utils'
import { SortButton } from './sort-button'
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

  const handleActionSelect = (actionType: string) => {}

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

  useEffect(() => {
    setDocumentsState(allFiles)
  }, [allFiles])

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
                    />
                  ) : (
                    <div></div>
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
        {/* Document Detail Modal */}
      </div>
    </div>
  )
}
