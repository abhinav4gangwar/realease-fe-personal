'use client'

import type { Comment, CommentAnnotation, User } from '@/types/comment.types'
import type { Document } from '@/types/document.types'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ChevronRight, Download, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { HiShare } from 'react-icons/hi2'
import { getInitialScale, isImageFile } from '../doc_utils'
import { CommentService } from '../doc_utils/comment.services'
import { Annotation } from './comment-components/annotation'
import { CommentMarker } from './comment-components/comment-marker'
import { CommentModal } from './comment-components/comment-modal'
import { PDFHeader } from './comment-components/pdf-header'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

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
  const [documentType, setDocumentType] = useState<'pdf' | 'image' | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState<number>(getInitialScale())
  const [isLoading, setIsLoading] = useState<boolean>(false)

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
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null)
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null
  )

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
    if (isOpen && document && !document.isFolder) {
      loadDocument()
      loadComments()
      loadUsers()
    }
  }, [isOpen, document])

  const loadDocument = async () => {
    if (!document) return

    setIsLoading(true)

    setDocumentUrl(null)
    setDocumentType(null)
    setNumPages(null)

    try {
      // Determine document type
      const isImage = isImageFile(document)

      if (isImage) {
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

      setDocumentUrl(null)
      setDocumentType(null)
      setNumPages(null)
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

  const handleSidebarCommentClick = (commentId: number) => {
    setActiveCommentId(commentId)
    setIsSidebarOpen(false)
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
            {/* Zoom Controls - Positioned relative to scrollable container */}
            {documentUrl && (
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
                                      handleCommentDelete(comment.id)
                                    }
                                    onReply={handleReply}
                                    onEditReply={handleEditReply}
                                    onDeleteReply={handleDeleteReply}
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
                ) : (
                  // Image viewer
                  <div
                    ref={imageContainerRef}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <div ref={imageRef} className="relative bg-white shadow-lg">
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
                          <div key={comment.id} className="comment-marker">
                            <CommentMarker
                              comment={comment}
                              users={users}
                              onClick={() => setActiveCommentId(comment.id)}
                              onEdit={() => handleCommentEdit(comment)}
                              onDelete={() => handleCommentDelete(comment.id)}
                              onReply={handleReply}
                              onEditReply={handleEditReply}
                              onDeleteReply={handleDeleteReply}
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

          {/* Comments Sidebar - Fixed width, independent of content */}
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
                                  handleCommentDelete(comment.id)
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
    </div>
  )
}
