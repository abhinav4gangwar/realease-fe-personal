'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/hooks/useEscHook'
import type {
  BreadcrumbItem,
  Document,
  FilterState,
  FilterType,
  SortField,
  SortOrder,
  ViewMode,
} from '@/types/document.types'
import { Properties } from '@/types/property.types'
import { getFileTypeFromMime } from '@/utils/fileTypeUtils'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { propertiesApi } from '../../properties/_property_utils/property.services'
import {
  getAllFolders,
  getFileCounts,
  getFolderCounts,
  handleBulkDownload,
  handleDownloadClick,
} from '../doc_utils'
import { ActionsButton } from './actions-button'
import { AddButton, type addType } from './add-button'
import { BreadcrumbNavigation } from './breadcrumb-navigation'
import BulkDeleteModal from './bulk-delete-modal'
import { CancelShareModal } from './cancel-share-modal'
import DocumentDeleteModal from './document-delete-modal'
import { DocumentDetailModal } from './document-detail-modal'
import { DocumentGridView } from './document-grid-view'
import { DocumentListView } from './document-list-view'
import { FilterButton } from './filter-button'
import { FilterModal } from './filter-modal'
import { MoveDocumentModal } from './move-document-modal'
import ScrollToTop from './scroll-to-top'
import { SelectedDocsModal } from './selected-docs-modal'
import { ShareEmailModal } from './share-email-modal'
import { SortButton } from './sort-button'
import { UploadModal } from './upload-modal'
import { ViewModeToggle } from './viewmode-toggle'

const UnifiedDocumentViewer = dynamic(
  () =>
    import('./unified-document-viewer').then(
      (mod) => mod.UnifiedDocumentViewer
    ),
  {
    ssr: false,
  }
)

export interface DocumentViewerProps {
  recentlyAccessed?: Document[]
  allFiles: Document[]
  apiClient: any
  transformApiResponse: (apiData: any) => Document[]
}

export function DocumentViewer({
  allFiles,
  apiClient,
  transformApiResponse,
}: DocumentViewerProps) {
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
    selectedTags: [],
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
  const [isSelectMode, setIsSelectMode] = useState(false)
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
  const [openBulkDeleteModal, setOpenBulkDeleteModal] = useState(false)
  const [isIndividualShare, setIsIndividualShare] = useState(false)
  const [properties, setProperties] = useState<Properties[]>([])

  const itemsPerPage = 15

  const handleDocumentInfo = (document: Document) => {
    setSelectedDocument(document)
    setOpenModalInEditMode(false)
    setIsModalOpen(true)
  }

  const handleDocumentPreview = (document: Document) => {
    if (document.isFolder) {
      handleFolderClick(document)
    } else {
      setSelectedDocument(document)
      setIsPdfPreviewOpen(true)
    }
  }

  const handleEditFromPdfPreview = (document: Document) => {
    setIsPdfPreviewOpen(false)
    setSelectedDocument(document)
    setOpenModalInEditMode(true)
    setIsModalOpen(true)
  }

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const propertiesList = await propertiesApi.getProperties()
        setProperties([
          { id: '0', name: 'No Property' } as Properties,
          ...propertiesList,
        ])
      } catch (error) {
        console.error('Failed to load properties:', error)
        setProperties([{ id: '0', name: 'No Property' } as Properties])
      }
    }

    loadProperties()
  }, [])

  const handleDocumentRename = async (documentId: string, newName: string) => {
    try {
      await apiClient.put('/dashboard/documents/rename', {
        itemId: Number.parseInt(documentId),
        newName: newName,
      })
      setOpenModalInEditMode(false)
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
      setOpenModalInEditMode(false)
      const getPropertyName = (propertyId: string) => {
        if (propertyId === '0') return 'No Property'
        const property = properties.find((p) => p.id === propertyId)
        return property ? property.name : 'No Property'
      }

      const updateDocumentInArray = (docs: Document[]): Document[] => {
        return docs.map((doc) => {
          if (doc.id === documentId) {
            return {
              ...doc,
              name: data.name,
              linkedProperty: getPropertyName(data.propertyId),
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
                linkedProperty: getPropertyName(data.propertyId),
                tags: data.tags.join(', '),
              }
            : null
        )
      }
      if (currentFolder) {
        setCurrentFolder((prev) => {
          if (!prev) return null

          const updateChildren = (children: Document[]): Document[] => {
            return children.map((child) => {
              if (child.id === documentId) {
                return {
                  ...child,
                  name: data.name,
                  linkedProperty: getPropertyName(data.propertyId),
                  tags: data.tags.join(', '),
                }
              }
              return child
            })
          }

          return {
            ...prev,
            children: updateChildren(prev.children || []),
          }
        })
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
    let folderToUse = folder

    if (!folder.children || folder.children.length === 0) {
      const folderContents = await fetchFolderContents(folder.id)
      folderToUse = { ...folder, children: folderContents }
      setCurrentFolder(folderToUse)
    } else {
      setCurrentFolder(folder)
    }

    setBreadcrumbs((prev) => [
      ...prev,
      {
        name: `${folderToUse.name} (${getFolderCounts(folderToUse)})`,
        id: folderToUse.id,
      },
    ])
  }

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === breadcrumbs.length - 1) {
      return
    }

    if (index === 0) {
      setCurrentFolder(null)
      setBreadcrumbs([{ name: 'Documents' }])
    } else {
      const targetBreadcrumb = breadcrumbs[index]

      setBreadcrumbs((prev) => prev.slice(0, index + 1))

      if (targetBreadcrumb.id) {
        const findFolder = (
          docs: Document[],
          folderId: string
        ): Document | null => {
          for (const doc of docs) {
            if (doc.id === folderId) return doc
            if (doc.children) {
              const found = findFolder(doc.children, folderId)
              if (found) return found
            }
          }
          return null
        }

        setDocumentsState((currentDocs) => {
          const targetFolder = findFolder(currentDocs, targetBreadcrumb.id!)
          if (targetFolder) {
            if (!targetFolder.children || targetFolder.children.length === 0) {
              fetchFolderContents(targetBreadcrumb.id!).then((contents) => {
                setCurrentFolder({ ...targetFolder, children: contents })
              })
            } else {
              setCurrentFolder(targetFolder)
            }
          }
          return currentDocs
        })
      }
    }
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleMoveClick = (document: Document) => {
    setDocumentToMove(document)
    setIsMoveModalOpen(true)
  }

  const handleShareClick = (document: Document) => {
    setIsIndividualShare(true)
    setSelectedDocuments([document.id])
    setSelectedDocument(document)
    setIsSelectedDocsModalOpen(true)
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

    if (filterState.type === 'tags') {
      return documents.filter((doc) => {
        const tagArray = Array.isArray(doc.tags)
          ? doc.tags
          : typeof doc.tags === 'string'
            ? doc.tags.split(',').map((t) => t.trim())
            : []

        return filterState.selectedTags.some((tag) =>
          tagArray.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
        )
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
    if (filterState.type === 'tags') {
      return documents.reduce(
        (groups, doc) => {
          const tagArray = Array.isArray(doc.tags)
            ? doc.tags
            : typeof doc.tags === 'string'
              ? doc.tags.split(',').map((t) => t.trim())
              : []

          if (tagArray.length === 0) {
            if (!groups['No Tags']) groups['No Tags'] = []
            groups['No Tags'].push(doc)
          } else {
            tagArray.forEach((tag) => {
              if (!groups[tag]) groups[tag] = []
              groups[tag].push(doc)
            })
          }

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

  const handleAddSelect = (addType: addType) => {
    setAddModaltype(addType)
    setUploadModalOpen(true)
  }

  const handleFilterSelect = (filterType: FilterType) => {
    if (
      filterType === 'property' ||
      filterType === 'type' ||
      filterType === 'tags'
    ) {
      setFilterModalType(filterType)
      setIsFilterModalOpen(true)
    } else {
      setFilterState({
        type: filterType,
        selectedProperties: [],
        selectedTypes: [],
        selectedTags: [],
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
      selectedTags: filterModalType === 'tags' ? selectedItems : [],
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
        data: [
          {
            itemId: Number.parseInt(selectedDocument.id),
          },
        ],
      })
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
      const response = await apiClient.delete('/dashboard/documents/delete', {
        data: deletePayload,
      })
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

  const handleBulkMove = async (newParentId: string | null) => {
    if (selectedDocuments.length === 0) return
    try {
      const movePayload = selectedDocuments.map((id) => ({
        itemId: Number.parseInt(id),
        newParentId: newParentId ? Number.parseInt(newParentId) : null,
      }))
      await apiClient.put('/dashboard/documents/move', movePayload)
      await handleUploadSuccess()
      resetSelectMode()
      toast.success(`${selectedDocuments.length} documents moved successfully`)
    } catch (error: any) {
      console.error('Error moving documents:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to move documents. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

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
      case 'move':
        if (selectedDocuments.length > 0) {
          setDocumentToMove({
            id: 'bulk',
            name: `${selectedDocuments.length} selected documents`,
            isFolder: false,
            icon: 'file',
            linkedProperty: '',
            dateAdded: '',
            tags: '',
            fileType: '',
          } as Document)
          setIsMoveModalOpen(true)
        }
        break
      case 'download':
        if (selectedDocuments.length > 0) {
          handleBulkDownload(selectedDocuments, undefined, documentsState)
        }
        break
      case 'share':
        if (selectedDocuments.length > 0) {
          setIsIndividualShare(false)
          setIsSelectedDocsModalOpen(true)
        }
        break
      case 'delete':
        if (selectedDocuments.length > 0) {
          setOpenBulkDeleteModal(true)
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

  const handleRemoveSelectedDocument = (documentId: string) => {
    setSelectedDocuments((prev) => prev.filter((id) => id !== documentId))
  }

  const resetSelectMode = () => {
    setIsSelectMode(false)
    setSelectedDocuments([])
    setIsSelectedDocsModalOpen(false)
    setIsShareEmailModalOpen(false)
    setIsCancelShareModalOpen(false)
    setIsIndividualShare(false)
  }

  const confirmCancelShare = () => {
    resetSelectMode()
  }

  const handleCancelFromModal = () => {
    setIsSelectedDocsModalOpen(false)
    setIsShareEmailModalOpen(false)
    setIsCancelShareModalOpen(true)
  }

  const handleModalClose = () => {
    if (isIndividualShare) {
      resetSelectMode()
    } else {
      setIsSelectedDocsModalOpen(false)
      setIsShareEmailModalOpen(false)
    }
  }

  const handleBack = () => {
    setIsSelectedDocsModalOpen(true)
    setIsShareEmailModalOpen(false)
  }

  const getSelectedDocumentObjects = () => {
    const flattenDocuments = (docs: Document[]): Document[] => {
      const result: Document[] = []
      docs.forEach((doc) => {
        result.push(doc)
        if (doc.children && doc.children.length > 0) {
          result.push(...flattenDocuments(doc.children))
        }
      })
      return result
    }

    const allDocsFlattened = flattenDocuments(documentsState)

    if (currentFolder && currentFolder.children) {
      const currentFolderDocs = flattenDocuments(currentFolder.children)
      currentFolderDocs.forEach((doc) => {
        if (!allDocsFlattened.find((d) => d.id === doc.id)) {
          allDocsFlattened.push(doc)
        }
      })
    }

    return selectedDocuments
      .map((id) => allDocsFlattened.find((doc) => doc.id === id))
      .filter(Boolean) as Document[]
  }

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

  const handleMoveDocument = async (
    documentId: string,
    newParentId: string | null
  ) => {
    try {
      const movePayload = [
        {
          itemId: Number.parseInt(documentId),
          newParentId: newParentId ? Number.parseInt(newParentId) : null,
        },
      ]
      await apiClient.put('/dashboard/documents/move', movePayload)
      await handleUploadSuccess()
      toast.success(`Document moved successfully`)
    } catch (error: any) {
      console.error('Error moving document:', error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to move document. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  useEscapeKey(() => {
    if (isModalOpen) {
      setIsModalOpen(false)
      setOpenModalInEditMode(false)
      setSelectedDocument(null)
    }
  }, isModalOpen)

  useEscapeKey(() => {
    if (isPdfPreviewOpen) {
      setIsPdfPreviewOpen(false)
      if (!isModalOpen) {
        setSelectedDocument(null)
      }
    }
  }, isPdfPreviewOpen)

  useEscapeKey(() => setIsFilterModalOpen(false), isFilterModalOpen)

  useEscapeKey(() => setUploadModalOpen(false), isUploadModalOpen)

  useEscapeKey(() => handleModalClose(), isShareEmailModalOpen)

  useEscapeKey(() => setIsCancelShareModalOpen(false), isCancelShareModalOpen)

  useEscapeKey(() => setOpenDeleteModal(false), openDeleteModal)

  useEscapeKey(() => handleModalClose(), isSelectedDocsModalOpen)

  useEscapeKey(() => {
    setIsMoveModalOpen(false)
    setDocumentToMove(null)
  }, isMoveModalOpen)

  useEscapeKey(() => setOpenBulkDeleteModal(false), openBulkDeleteModal)

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

          <PlanAccessWrapper featureId="DOCUMENT_TAGGING_FILTERING">
            <FilterButton onFilterSelect={handleFilterSelect} />
          </PlanAccessWrapper>

          <SortButton onSortChange={handleSortChange} />
          {isSelectMode && selectedDocuments.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedDocuments.length} selected
            </div>
          )}

          <ActionsButton
            onActionSelect={handleActionSelect}
            isSelectMode={isSelectMode}
            selectedCount={selectedDocuments.length}
          />

          <AddButton onAddSelect={handleAddSelect} />
        </div>
      </div>

      {currentFolder && (
        <div className="mb-6 flex gap-2">
          <Button
            className="text-secondary h-1 w-1 cursor-pointer bg-transparent pt-3 hover:bg-transparent"
            onClick={() => handleBreadcrumbNavigate(0)}
          >
            <ArrowLeft className="size-4" />
          </Button>
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
                    <PlanAccessWrapper featureId="PERM_DOC_VIEW">
                      <DocumentListView
                        documents={paginatedDocuments}
                        onDocumentInfo={handleDocumentInfo}
                        onDocumentPreview={handleDocumentPreview}
                        onFolderClick={handleFolderClick}
                        selectedDocumentId={selectedDocument?.id}
                        isShareMode={isSelectMode}
                        selectedDocuments={selectedDocuments}
                        onDocumentSelect={handleDocumentSelect}
                        onEditClick={handleEditClick}
                        loadingFolders={loadingFolders}
                        onDeleteClick={handleDeleteClick}
                        onMoveClick={handleMoveClick}
                        onShareClick={handleShareClick}
                        onDownloadClick={handleDownloadClick}
                        onSelectAll={handleSelectAll}
                        selectAllState={getSelectAllState()}
                      />
                    </PlanAccessWrapper>
                  ) : (
                    <div>
                      <PlanAccessWrapper featureId="PERM_DOC_VIEW">
                        <DocumentGridView
                          documents={paginatedDocuments}
                          onDocumentInfo={handleDocumentInfo}
                          onDocumentPreview={handleDocumentPreview}
                          onFolderClick={handleFolderClick}
                          selectedDocumentId={selectedDocument?.id}
                          isShareMode={isSelectMode}
                          selectedDocuments={selectedDocuments}
                          onDocumentSelect={handleDocumentSelect}
                          onEditClick={handleEditClick}
                          loadingFolders={loadingFolders}
                          onDeleteClick={handleDeleteClick}
                          onMoveClick={handleMoveClick}
                          onShareClick={handleShareClick}
                          onDownloadClick={handleDownloadClick}
                          isModelOpen={isModalOpen}
                        />
                      </PlanAccessWrapper>
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
          onEditFile={handleFileEdit}
          onDeleteClick={handleDeleteClick}
          onShareClick={handleShareClick}
          onMoveClick={handleMoveClick}
          onDownloadClick={handleDownloadClick}
        />
        {/* Document Preview Modal */}
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
          onShareClick={handleShareClick}
          onMoveClick={handleMoveClick}
          onDownloadClick={handleDownloadClick}
          onEditClick={handleEditFromPdfPreview}
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
          currentFolderId={currentFolder?.id || null}
        />
        <ShareEmailModal
          isOpen={isShareEmailModalOpen}
          onClose={handleModalClose}
          selectedDocuments={getSelectedDocumentObjects()}
          onCancel={handleCancelFromModal}
          onBack={handleBack}
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
          onMove={async (documentId: string, newParentId: string | null) => {
            if (documentId === 'bulk') {
              await handleBulkMove(newParentId)
            } else {
              await handleMoveDocument(documentId, newParentId)
            }
          }}
          selectedDocumentIds={selectedDocuments}
          apiClient={apiClient}
          transformApiResponse={transformApiResponse}
        />
        <BulkDeleteModal
          isOpen={openBulkDeleteModal}
          onConfirm={() => {
            setOpenBulkDeleteModal(false)
            handleBulkDelete()
          }}
          onCancel={() => setOpenBulkDeleteModal(false)}
          selectedCount={selectedDocuments.length}
        />
      </div>
    </div>
  )
}
