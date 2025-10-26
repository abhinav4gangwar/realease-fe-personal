'use client'

import type { Comment, CommentAnnotation, User } from '@/types/comment.types'
import type { Document } from '@/types/document.types'
import dynamic from 'next/dynamic'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { toast } from 'sonner'

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
import { Button } from '@/components/ui/button'
import { ChevronRight, Download, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { HiShare } from 'react-icons/hi2'
import { getInitialScale, isImageFile, isKmlFile } from '../doc_utils'
import { CommentService } from '../doc_utils/comment.services'
import { Annotation } from './comment-components/annotation'
import { CommentMarker } from './comment-components/comment-marker'
import { CommentModal } from './comment-components/comment-modal'
import { PDFHeader } from './comment-components/pdf-header'

// Dynamically import Leaflet components for KML viewing
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface KmlShape {
  name: string
  type: 'Polygon' | 'LineString' | 'Point'
  coordinates: any // e.g., [[lat, lng], ...] for Polyline, or [[[lat, lng], ...]] for Polygon
}

// API function to get users
export const getUsers = async (documentId: number, apiClient: any) => {
  try {
    const response = await apiClient.get(
      `/dashboard/documents/getUsers/${documentId}`
    )
    const users = response.data.users
    return users
  } catch (error) {
    console.log(error)
    return []
  }
}

interface UnifiedDocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  apiClient: any
  onMoveClick?: (document: Document) => void
  onShareClick?: (document: Document) => void
  onDownloadClick?: (document: Document) => void
  onEditClick?: (document: Document) => void
}

export function UnifiedDocumentViewer({
  isOpen,
  onClose,
  document,
  apiClient,
  onMoveClick,
  onShareClick,
  onDownloadClick,
  onEditClick,
}: UnifiedDocumentViewerProps) {
  // Document state
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<
    'pdf' | 'image' | 'kml' | null
  >(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState<number>(getInitialScale())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // KML-specific state
  const [kmlLayers, setKmlLayers] = useState<KmlShape[]>([])
  const [isLoadingKml, setIsLoadingKml] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Comment and annotation state
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [tempAnnotation, setTempAnnotation] =
    useState<CommentAnnotation | null>(null)
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false)
  const [isCreatingComment, setIsCreatingComment] = useState<boolean>(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [commentToDelete, setCommentToDelete] = useState<{
    id: number
    type: 'comment' | 'reply'
  } | null>(null)
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null)
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null
  )

  const handleCommentDeleteClick = (commentId: number) => {
    setCommentToDelete({ id: commentId, type: 'comment' })
    setDeleteDialogOpen(true)
  }

  const handleReplyDeleteClick = (replyId: number) => {
    setCommentToDelete({ id: replyId, type: 'reply' })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return

    if (commentToDelete.type === 'comment') {
      await handleCommentDelete(commentToDelete.id)
    } else {
      await handleDeleteReply(commentToDelete.id)
    }

    setDeleteDialogOpen(false)
    setCommentToDelete(null)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setCommentToDelete(null)
  }

  // UI state
  const [hasTextSelection, setHasTextSelection] = useState<boolean>(false)
  const [selectionPosition, setSelectionPosition] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false)
  const [commentModalPosition, setCommentModalPosition] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  const [editingComment, setEditingComment] = useState<Comment | null>(null)

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Refs
  const pageRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const commentService = useRef<CommentService | null>(null)

  // Initialize comment service
  useEffect(() => {
    if (apiClient) {
      commentService.current = new CommentService(apiClient)
    }
  }, [apiClient])

  // Load document, comments, and users when document changes
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isOpen && document && !document.isFolder) {
      loadDocument()
      loadComments()
      loadUsers()
    }
  }, [isOpen, document])

  // KML extraction function
  const extractKmlShapes = useCallback((kmlDoc: Document): KmlShape[] => {
    const shapes: KmlShape[] = []
    const placemarks = kmlDoc.querySelectorAll('Placemark')

    placemarks.forEach((placemark) => {
      const name =
        placemark.querySelector('name')?.textContent || 'Unnamed Shape'

      const processCoordinates = (
        coordString: string | null | undefined
      ): [number, number][] => {
        if (!coordString) return []
        const points: [number, number][] = []
        const coordPairs = coordString
          .trim()
          .split(/[\s\n\r]+/)
          .filter(Boolean)

        coordPairs.forEach((pair) => {
          const coords = pair
            .split(',')
            .map((c) => parseFloat(c.trim()))
            .filter((n) => !isNaN(n))
          if (coords.length >= 2) {
            points.push([coords[1], coords[0]]) // Leaflet uses [lat, lng]
          }
        })

        return points
      }

      // Check for Polygon
      const polygon = placemark.querySelector('Polygon LinearRing coordinates')
      if (polygon) {
        const coordinates = processCoordinates(polygon.textContent)
        if (coordinates.length >= 3) {
          shapes.push({
            name,
            type: 'Polygon',
            coordinates: [coordinates], // Polygon expects array of coordinate arrays
          })
          return
        }
      }

      // Check for LineString
      const lineString = placemark.querySelector('LineString coordinates')
      if (lineString) {
        const coordinates = processCoordinates(lineString.textContent)
        if (coordinates.length >= 2) {
          shapes.push({
            name,
            type: 'LineString',
            coordinates,
          })
          return
        }
      }

      // Check for Point
      const point = placemark.querySelector('Point coordinates')
      if (point) {
        const coordinates = processCoordinates(point.textContent)
        if (coordinates.length >= 1) {
          shapes.push({
            name,
            type: 'Point',
            coordinates: coordinates[0],
          })
          return
        }
      }
    })

    return shapes
  }, [])

  const loadDocument = async () => {
    if (!document) return

    setIsLoading(true)

    setDocumentUrl(null)
    setDocumentType(null)
    setNumPages(null)

    try {
      // Determine document type
      const isImage = isImageFile(document)
      const isKml = isKmlFile(document)

      if (isKml) {
        setDocumentType('kml')
        setIsLoadingKml(true)

        // For KML files, get the raw KML content
        const response = await apiClient.post(
          '/dashboard/documents/download',
          {
            items: [{ id: parseInt(document.id), type: 'file' }],
          },
          { responseType: 'text' }
        )

        if (response.data) {
          const parser = new DOMParser()
          const kmlDoc = parser.parseFromString(response.data, 'text/xml')
          const shapes = extractKmlShapes(kmlDoc)
          setKmlLayers(shapes)
          console.log(
            `✅ Loaded ${shapes.length} shapes from KML file: ${document.name}`
          )
        }
        setIsLoadingKml(false)
      } else if (isImage) {
        setDocumentType('image')
        setScale(getInitialScale())
        // For images, get the original file
        const response = await apiClient.get(
          `/dashboard/documents/view/${document.id}?original=true`,
          {
            responseType: 'blob',
          }
        )
        const imageBlob = new Blob([response.data])
        const objectUrl = URL.createObjectURL(imageBlob)
        setDocumentUrl(objectUrl)
        setNumPages(1) // Images are single page
        setScale(1) // Reset scale to 100% for images
      } else {
        setDocumentType('pdf')
        // For PDFs and other files, get the PDF conversion
        const response = await apiClient.get(
          `/dashboard/documents/view/${document.id}`,
          {
            responseType: 'blob',
          }
        )
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
        const objectUrl = URL.createObjectURL(pdfBlob)
        setDocumentUrl(objectUrl)
      }
    } catch (error) {
      console.error('Error loading document:', error)
      toast.error('Failed to load document')
      setIsLoadingKml(false)

      setDocumentUrl(null)
      setDocumentType(null)
      setNumPages(null)
      setKmlLayers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    if (!document || !commentService.current) return

    setIsLoadingComments(true)
    try {
      const fetchedComments = await commentService.current.getComments(
        Number.parseInt(document.id)
      )
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const loadUsers = async () => {
    if (!document || !apiClient) return

    setIsLoadingUsers(true)
    try {
      const fetchedUsers = await getUsers(
        Number.parseInt(document.id),
        apiClient
      )
      setUsers(fetchedUsers || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Handle text selection for PDFs
  const handleMouseUp = (e: MouseEvent): void => {
    if (documentType !== 'pdf') return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setHasTextSelection(false)
      setTempAnnotation(null)
      return
    }

    const range = selection.getRangeAt(0)

    // Check if the selection contains actual text content
    const selectedText = range.toString().trim()
    if (!selectedText) {
      setHasTextSelection(false)
      setTempAnnotation(null)
      selection.removeAllRanges()
      return
    }

    // Find which page the selection is on
    const pageElements = pageRef.current?.querySelectorAll('.react-pdf__Page')
    let targetPage = 1 // Default to page 1
    let pageContent: Element | null = null

    if (pageElements) {
      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i]
        const textContent = pageElement.querySelector(
          '.react-pdf__Page__textContent'
        )
        if (
          textContent &&
          textContent.contains(range.commonAncestorContainer)
        ) {
          targetPage = i + 1
          pageContent = textContent
          break
        }
      }
    }

    if (!pageContent) {
      setHasTextSelection(false)
      setTempAnnotation(null)
      selection.removeAllRanges()
      return
    }

    const pageRect = pageContent.getBoundingClientRect()
    const selectionRect = range.getBoundingClientRect()

    // Ensure we have valid selection bounds
    if (selectionRect.width === 0 || selectionRect.height === 0) {
      setHasTextSelection(false)
      setTempAnnotation(null)
      selection.removeAllRanges()
      return
    }

    // Improved coordinate calculation with bounds checking
    const x = Math.max(
      0,
      Math.min(
        100,
        ((selectionRect.left - pageRect.left) / pageRect.width) * 100
      )
    )
    const y = Math.max(
      0,
      Math.min(
        100,
        ((selectionRect.top - pageRect.top) / pageRect.height) * 100
      )
    )
    const width = Math.max(
      0.1,
      Math.min(100 - x, (selectionRect.width / pageRect.width) * 100)
    )
    const height = Math.max(
      0.1,
      Math.min(100 - y, (selectionRect.height / pageRect.height) * 100)
    )

    if (width > 0 && height > 0) {
      const newAnnotation: CommentAnnotation = {
        id: `temp-${Date.now()}`,
        page: targetPage,
        rect: { x, y, width, height },
      }

      setTempAnnotation(newAnnotation)
      setSelectionPosition({ x: e.clientX, y: e.clientY })
      setHasTextSelection(true)

      // Clear the selection to prevent interference
      setTimeout(() => {
        selection.removeAllRanges()
      }, 100)
    } else {
      setHasTextSelection(false)
      setTempAnnotation(null)
      selection.removeAllRanges()
    }
  }

  // Handle click-to-annotate for images only (PDFs use text selection + comment icon)
  const handleClick = (e: MouseEvent): void => {
    // Only handle clicks for images, not PDFs
    if (documentType !== 'image') return

    // Only handle clicks if no text is selected and not clicking on existing annotations
    if (hasTextSelection) return

    const target = e.target as HTMLElement
    if (target.closest('.comment-marker') || target.closest('.annotation'))
      return

    // Check if clicking on zoom controls
    if (target.closest('.zoom-controls')) return

    const pageElement = imageRef.current
    const targetPage = 1

    if (!pageElement) return

    const rect = pageElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newAnnotation: CommentAnnotation = {
      id: `temp-${Date.now()}`,
      page: targetPage,
      rect: { x, y, width: 2, height: 2 }, // Small point annotation
    }

    setTempAnnotation(newAnnotation)
    setSelectionPosition({ x: e.clientX, y: e.clientY })
    setHasTextSelection(true)

    // Auto-open comment modal for click-to-annotate (images only)
    setCommentModalPosition({ x: e.clientX, y: e.clientY })
    setEditingComment(null)
    setActiveCommentId(null)
    setIsCommentModalOpen(true)
  }

  const handleCommentIconClick = () => {
    if (!hasTextSelection || !tempAnnotation) {
      toast.error('Select text to comment')
      return
    }

    // For PDFs, always open modal when comment icon is clicked after text selection
    // For images, this shouldn't be called as they use click-to-annotate
    setCommentModalPosition(selectionPosition)
    setEditingComment(null)
    setActiveCommentId(null)
    setIsCommentModalOpen(true)
  }

  const handleEditClick = () => {
    if (document && onEditClick) {
      onEditClick(document)
    }
  }

  const handleCommentSubmit = async (text: string) => {
    if (!tempAnnotation || !document || !commentService.current) return

    setIsCreatingComment(true)
    try {
      const newComment = await commentService.current.createComment({
        text,
        documentId: Number.parseInt(document.id),
        annotation: tempAnnotation,
      })

      setComments((prev) => [...prev, newComment])
      setTempAnnotation(null)
      setHasTextSelection(false)
      setIsCommentModalOpen(false)
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsCreatingComment(false)
    }
  }

  const handleCommentUpdate = async (commentId: number, text: string) => {
    if (!commentService.current) return

    setIsCreatingComment(true)
    try {
      const updatedComment = await commentService.current.updateComment({
        commentId,
        text,
      })

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      )
      setEditingComment(null)
      setIsCommentModalOpen(false)
      setActiveCommentId(null)
      toast.success('Comment updated successfully')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    } finally {
      setIsCreatingComment(false)
    }
  }

  const handleCommentEdit = (comment: Comment) => {
    setEditingComment(comment)
    setCommentModalPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    setActiveCommentId(null)
    setIsCommentModalOpen(true)
  }

  const handleCommentDelete = async (commentId: number) => {
    if (!commentService.current) return

    setDeletingCommentId(commentId)
    try {
      await commentService.current.deleteComment(commentId)
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      setActiveCommentId(null)
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleReply = async (parentId: number, text: string) => {
    if (!document || !commentService.current) return

    setReplyingToCommentId(parentId)
    try {
      const response = await commentService.current.createReply({
        text,
        documentId: Number.parseInt(document.id),
        parentId,
      })

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return response
          }
          return comment
        })
      )
      toast.success('Reply added successfully')
    } catch (error) {
      console.error('Error creating reply:', error)
      toast.error('Failed to add reply')
    } finally {
      setReplyingToCommentId(null)
    }
  }

  const handleEditReply = (reply: Comment) => {
    setEditingComment(reply)
    setCommentModalPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    setActiveCommentId(null)
    setIsCommentModalOpen(true)
  }

  const handleDeleteReply = async (replyId: number) => {
    if (!commentService.current) return

    setDeletingReplyId(replyId)
    try {
      await commentService.current.deleteComment(replyId)
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          children:
            comment.children?.filter((child) => child.id !== replyId) || [],
        }))
      )
      toast.success('Reply deleted successfully')
    } catch (error) {
      console.error('Error deleting reply:', error)
      toast.error('Failed to delete reply')
    } finally {
      setDeletingReplyId(null)
    }
  }

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false)
    setTempAnnotation(null)
    setEditingComment(null)
    setHasTextSelection(false)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }

  // PDF navigation and zoom
  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number
  }): void => {
    setNumPages(nextNumPages)
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3.0))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5))

  const handleCancelComment = () => {
    setActiveCommentId(null)
  }

  const scrollToCommentMarker = (commentId: number) => {
    const markerId = `marker-${commentId}`
    const markerElement = window.document.getElementById(
      markerId
    ) as HTMLElement
    if (markerElement) {
      markerElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    }
  }

  const handleSidebarCommentClick = (commentId: number) => {
    setActiveCommentId(commentId)
    scrollToCommentMarker(commentId)
  }

  if (!isOpen) return null

  const allAnnotations: CommentAnnotation[] = [
    ...comments.map((c) => c.annotation),
    ...(tempAnnotation ? [tempAnnotation] : []),
  ]

  const getUserById = (userId: number) => {
    return users.find((user) => user.id === userId)
  }

  const handlePreviewClose = () => {
    onClose()
    setIsSidebarOpen(true)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-secondary flex h-full w-full flex-col shadow-xl">
        {/* Header - Fixed at top, outside scrollable area */}
        <div className="flex-shrink-0">
          <PDFHeader
            document={document}
            isLoadingComments={isLoadingComments}
            hasTextSelection={hasTextSelection}
            onClose={handlePreviewClose}
            onShareClick={onShareClick}
            onDownloadClick={onDownloadClick}
            onMoveClick={onMoveClick}
            onEditClick={handleEditClick}
            onCommentClick={handleCommentIconClick}
            onSideClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Main Content with Sidebar - Flex container below header */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Document Content - Scrollable area */}
          <div
            className="relative flex-1 overflow-auto bg-gray-100"
            onMouseUp={handleMouseUp}
            onClick={handleClick}
          >
            {/* Zoom Controls - Positioned relative to scrollable container (hidden for KML) */}
            {documentUrl && documentType !== 'kml' && (
              <div className="zoom-controls sticky top-[92%] left-1/2 z-30 mx-auto hidden w-fit -translate-x-1/2 items-center gap-1 rounded-lg bg-[#9B9B9D] p-1 text-white shadow-lg lg:flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomOut()
                  }}
                  disabled={scale <= 0.5}
                  className="h-8 w-8 rounded p-0 hover:bg-white/20 disabled:opacity-50"
                >
                  <span className="text-sm">-</span>
                </button>
                <span className="min-w-[50px] px-2 text-center text-sm font-medium">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomIn()
                  }}
                  disabled={scale >= 2}
                  className="h-8 w-8 rounded p-0 hover:bg-white/20 disabled:opacity-50"
                >
                  <span className="text-sm">+</span>
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading document...</p>
                </div>
              </div>
            ) : documentUrl ? (
              <div className="flex justify-center p-6">
                {documentType === 'pdf' ? (
                  <PDFDocument
                    file={documentUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={console.error}
                    loading={
                      <div className="p-8 text-center">Loading document...</div>
                    }
                  >
                    <div ref={pageRef} className="space-y-4">
                      {/* Render all pages for scroll functionality */}
                      {Array.from({ length: numPages || 1 }, (_, index) => {
                        const pageNumber = index + 1
                        const pageComments = comments.filter(
                          (comment) => comment.annotation.page === pageNumber
                        )
                        const pageAnnotations = allAnnotations.filter(
                          (anno) => anno.page === pageNumber
                        )

                        return (
                          <div
                            key={`page_${pageNumber}`}
                            id={`page-${pageNumber}`}
                            className="relative mb-4 bg-white shadow-lg"
                          >
                            <Page
                              pageNumber={pageNumber}
                              scale={scale}
                              renderTextLayer={true}
                            />

                            {/* Annotations overlay */}
                            <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                              {pageAnnotations.map((anno) => (
                                <Annotation
                                  key={anno.id}
                                  annotation={anno}
                                  isHighlighted={comments.some(
                                    (c) => c.annotation.id === anno.id
                                  )}
                                />
                              ))}
                            </div>

                            {/* Comment markers */}
                            <div className="absolute top-0 left-0 h-full w-full">
                              {pageComments.map((comment) => (
                                <div
                                  key={comment.id}
                                  id={`marker-${comment.id}`}
                                  className="comment-marker"
                                >
                                  <CommentMarker
                                    comment={comment}
                                    users={users}
                                    onClick={() =>
                                      setActiveCommentId(comment.id)
                                    }
                                    onEdit={() => handleCommentEdit(comment)}
                                    onDelete={() =>
                                      handleCommentDeleteClick(comment.id)
                                    }
                                    onReply={handleReply}
                                    onEditReply={handleEditReply}
                                    onDeleteReply={handleReplyDeleteClick}
                                    isDeleting={
                                      deletingCommentId === comment.id
                                    }
                                    isActive={activeCommentId === comment.id}
                                    isReplying={
                                      replyingToCommentId === comment.id
                                    }
                                    deletingReplyId={deletingReplyId}
                                    onCancel={handleCancelComment}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </PDFDocument>
                ) : documentType === 'kml' ? (
                  // KML Map viewer
                  <div className="relative h-full w-full">
                    {/* KML Loading Indicator */}
                    {isLoadingKml && (
                      <div className="absolute top-4 left-4 z-[1000] rounded-lg bg-white px-3 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                          <span className="text-sm text-gray-700">
                            Loading KML file...
                          </span>
                        </div>
                      </div>
                    )}

                    {isClient ? (
                      <MapContainer
                        center={[20.5937, 78.9629]} // Default to India center
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* KML Shapes */}
                        {kmlLayers.map((shape, index) => {
                          const color = '#42d4f4' // Use a consistent color for all KML shapes

                          if (shape.type === 'Polygon' && shape.coordinates) {
                            return (
                              <Polygon
                                key={`kml-${index}`}
                                positions={shape.coordinates}
                                pathOptions={{
                                  color: color,
                                  fillColor: color,
                                  fillOpacity: 0.4,
                                }}
                              >
                                <Popup>{shape.name}</Popup>
                              </Polygon>
                            )
                          }

                          if (
                            shape.type === 'LineString' &&
                            shape.coordinates
                          ) {
                            return (
                              <Polyline
                                key={`kml-${index}`}
                                positions={shape.coordinates}
                                pathOptions={{ color: color }}
                              >
                                <Popup>{shape.name}</Popup>
                              </Polyline>
                            )
                          }

                          if (shape.type === 'Point' && shape.coordinates) {
                            return (
                              <Marker
                                key={`kml-${index}`}
                                position={shape.coordinates}
                              >
                                <Popup>{shape.name}</Popup>
                              </Marker>
                            )
                          }

                          return null
                        })}
                      </MapContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                          <p className="mt-4 text-gray-600">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Image viewer
                  <div
                    ref={imageContainerRef}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <div
                      id="page-1"
                      ref={imageRef}
                      className="relative bg-white shadow-lg"
                    >
                      <img
                        src={documentUrl}
                        alt={document?.name || 'Document'}
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin: 'center',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        className="block"
                      />

                      {/* Annotations overlay for images */}
                      <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                        {allAnnotations.map((anno) => (
                          <Annotation
                            key={anno.id}
                            annotation={anno}
                            isHighlighted={comments.some(
                              (c) => c.annotation.id === anno.id
                            )}
                          />
                        ))}
                      </div>

                      {/* Comment markers for images */}
                      <div className="absolute top-0 left-0 h-full w-full">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            id={`marker-${comment.id}`}
                            className="comment-marker"
                          >
                            <CommentMarker
                              comment={comment}
                              users={users}
                              onClick={() => setActiveCommentId(comment.id)}
                              onEdit={() => handleCommentEdit(comment)}
                              onDelete={() =>
                                handleCommentDeleteClick(comment.id)
                              }
                              onDeleteReply={handleReplyDeleteClick}
                              onReply={handleReply}
                              onEditReply={handleEditReply}
                              isDeleting={deletingCommentId === comment.id}
                              isActive={activeCommentId === comment.id}
                              isReplying={replyingToCommentId === comment.id}
                              deletingReplyId={deletingReplyId}
                              onCancel={handleCancelComment}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-black/75">
                <div className="bg-secondary flex flex-col items-center justify-center space-y-6 rounded-md p-6 lg:h-[300px] lg:w-[600px] lg:p-0">
                  <Image
                    src={'/assets/no-preview.svg'}
                    alt="no preview"
                    height={80}
                    width={80}
                  />
                  <p className="font-semibold text-white lg:text-lg">
                    Sorry, no preview available for this file format.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      className="h-12 w-[200px] cursor-pointer bg-white px-6 text-lg font-semibold text-black hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onDownloadClick && document) {
                          onDownloadClick(document)
                        }
                      }}
                    >
                      Download file{' '}
                      <Download className="text-primary h-3 w-3" />
                    </Button>
                    <Button
                      className="hidden h-12 w-[200px] cursor-pointer items-center justify-center bg-white px-6 text-lg font-semibold text-black hover:bg-white lg:flex"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onShareClick && document) {
                          onShareClick(document)
                        }
                      }}
                    >
                      Share file <HiShare className="text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Sidebar */}
          <div
            className={`flex-shrink-0 border-l border-gray-200 bg-white transition-all duration-300 ${
              isSidebarOpen ? 'w-80' : 'w-0'
            } hidden overflow-hidden lg:block`}
          >
            {isSidebarOpen && (
              <div className="flex h-full flex-col">
                {/* Sidebar Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Comments ({comments.length})
                    </h3>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="rounded-lg p-1 hover:bg-gray-100"
                    >
                      <ChevronRight size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-8 text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        No comments yet. Select text or click to add a comment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const user = getUserById(comment.userId)
                        return (
                          <div
                            key={comment.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              activeCommentId === comment.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() =>
                              handleSidebarCommentClick(comment.id)
                            }
                          >
                            {/* Comment Header */}
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                  {user?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {user?.name || 'Unknown User'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Page {comment.annotation.page}
                              </span>
                            </div>

                            {/* Comment Text */}
                            <p className="line-clamp-3 text-sm text-gray-800">
                              {comment.text}
                            </p>

                            {/* Comment Actions */}
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCommentEdit(comment)
                                }}
                                className="hover:text-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCommentDeleteClick(comment.id)
                                }}
                                className="hover:text-red-600"
                                disabled={deletingCommentId === comment.id}
                              >
                                {deletingCommentId === comment.id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>

                            {/* Replies */}
                            {comment.children &&
                              comment.children.length > 0 && (
                                <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                                  {comment.children.map((reply) => {
                                    const replyUser = getUserById(reply.userId)
                                    return (
                                      <div
                                        key={reply.id}
                                        className="rounded bg-gray-50 p-2"
                                      >
                                        <div className="mb-1 flex items-center gap-2">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                                            {replyUser?.name?.[0]?.toUpperCase() ||
                                              '?'}
                                          </div>
                                          <span className="text-xs font-medium text-gray-600">
                                            {replyUser?.name || 'Unknown User'}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-700">
                                          {reply.text}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleEditReply(reply)
                                            }}
                                            className="hover:text-blue-600"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteReply(reply.id)
                                            }}
                                            className="hover:text-red-600"
                                            disabled={
                                              deletingReplyId === reply.id
                                            }
                                          >
                                            {deletingReplyId === reply.id
                                              ? 'Deleting...'
                                              : 'Delete'}
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment Modal */}
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={handleCommentModalClose}
          onSubmit={handleCommentSubmit}
          onUpdate={handleCommentUpdate}
          position={commentModalPosition}
          users={users}
          isLoading={isCreatingComment}
          editingComment={editingComment}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='z-[99999]'>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{' '}
              {commentToDelete?.type === 'comment' ? 'comment' : 'reply'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-primary hover:bg-primary/90"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
