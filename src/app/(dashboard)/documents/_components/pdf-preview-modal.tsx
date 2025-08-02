"use client"

import type { Comment, CommentAnnotation, PDFPreviewModalProps, User } from "@/types/comment.types"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { toast } from "sonner"

import { CommentService } from "../doc_utils/comment.services"
import { Annotation } from "./comment-components/annotation"
import { CommentMarker } from "./comment-components/comment-marker"
import { CommentModal } from "./comment-components/comment-modal"
import { PDFControls } from "./comment-components/pdf-controls"
import { PDFHeader } from "./comment-components/pdf-header"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

// Mock users data
const mockUsers: User[] = [
  { id: "user-1", name: "Ada Lovelace" },
  { id: "user-2", name: "Grace Hopper" },
  { id: "user-3", name: "Margaret Hamilton" },
  { id: "user-4", name: "Katherine Johnson" },
]

export function PDFPreviewModal({
  isOpen,
  onClose,
  document,
  apiClient,
  onMoveClick,
  onShareClick,
  onDownloadClick,
  onEditClick, // Add this new prop
}: PDFPreviewModalProps) {
  // PDF and data state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pdfScale, setPdfScale] = useState<number>(1.2)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Comments and annotations state
  const [comments, setComments] = useState<Comment[]>([])
  const [users] = useState<User[]>(mockUsers)
  const [tempAnnotation, setTempAnnotation] = useState<CommentAnnotation | null>(null)
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false)
  const [isCreatingComment, setIsCreatingComment] = useState<boolean>(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null)
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null)

  // Comment modal state
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [commentModalPosition, setCommentModalPosition] = useState({ x: 0, y: 0 })
  const [editingComment, setEditingComment] = useState<Comment | null>(null)

  // Text selection state
  const [hasTextSelection, setHasTextSelection] = useState(false)
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })

  // Services
  const [commentService, setCommentService] = useState<CommentService | null>(null)

  // Refs
  const pageRef = useRef<HTMLDivElement>(null)

  // Initialize comment service
  useEffect(() => {
    if (apiClient) {
      setCommentService(new CommentService(apiClient))
    }
  }, [apiClient])

  // Load PDF and comments when document changes
  useEffect(() => {
    if (isOpen && document && !document.isFolder) {
      loadPdf()
      loadComments()
    }
  }, [isOpen, document])

  const loadPdf = async () => {
    if (!document) return

    setIsLoading(true)
    try {
      const response = await apiClient.get(`/dashboard/documents/view/${document.id}`, {
        responseType: "blob",
      })
      const pdfBlob = new Blob([response.data], { type: "application/pdf" })
      const objectUrl = URL.createObjectURL(pdfBlob)
      setPdfUrl(objectUrl)
    } catch (error) {
      console.error("Error loading PDF:", error)
      toast.error("Failed to load PDF document")
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    if (!document || !commentService) return

    setIsLoadingComments(true)
    try {
      const fetchedComments = await commentService.getComments(Number.parseInt(document.id))
      setComments(fetchedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
      toast.error("Failed to load comments")
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  useEffect(() => {
    if (!isOpen) {
      setPdfUrl(null)
      setCurrentPage(1)
      setNumPages(null)
      setTempAnnotation(null)
      setIsCommentModalOpen(false)
      setEditingComment(null)
      setComments([])
      setActiveCommentId(null)
      setReplyingToCommentId(null)
      setHasTextSelection(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const target = e.target as Element
      if (activeCommentId && !target?.closest(".comment-marker")) {
        setActiveCommentId(null)
      }
    }

    if (activeCommentId) {
      window.document.addEventListener("click", handleClickOutside)
      return () => window.document.removeEventListener("click", handleClickOutside)
    }
  }, [activeCommentId])

  const handleMouseUp = (e: MouseEvent): void => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setHasTextSelection(false)
      setTempAnnotation(null)
      return
    }

    const range = selection.getRangeAt(0)
    const pageContent = pageRef.current?.querySelector(".react-pdf__Page__textContent")

    if (!pageContent) return
    if (!pageContent.contains(range.commonAncestorContainer)) return

    const pageRect = pageContent.getBoundingClientRect()
    const selectionRect = range.getBoundingClientRect()

    const x = ((selectionRect.left - pageRect.left) / pageRect.width) * 100
    const y = ((selectionRect.top - pageRect.top) / pageRect.height) * 100
    const width = (selectionRect.width / pageRect.width) * 100
    const height = (selectionRect.height / pageRect.height) * 100

    if (width > 0 && height > 0) {
      const newAnnotation: CommentAnnotation = {
        id: `temp-${Date.now()}`,
        page: currentPage,
        rect: { x, y, width, height },
      }

      setTempAnnotation(newAnnotation)
      setSelectionPosition({ x: e.clientX, y: e.clientY })
      setHasTextSelection(true)
    }
  }

  const handleCommentIconClick = () => {
    if (!hasTextSelection || !tempAnnotation) {
      toast.error("Select something to comment")
      return
    }

    setCommentModalPosition(selectionPosition)
    setEditingComment(null)
    setActiveCommentId(null)
    setIsCommentModalOpen(true)
  }

  const handleEditClick = () => {
    if (document && onEditClick) {
      onEditClick(document)
      // Remove this line: onClose() // Don't close here, let parent handle it
    }
  }

  const handleCommentSubmit = async (text: string) => {
    if (!tempAnnotation || !document || !commentService) return

    setIsCreatingComment(true)
    try {
      const newComment = await commentService.createComment({
        text,
        documentId: Number.parseInt(document.id),
        annotation: tempAnnotation,
      })

      setComments((prev) => [...prev, newComment])
      setTempAnnotation(null)
      setHasTextSelection(false)
      setIsCommentModalOpen(false)
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error creating comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setIsCreatingComment(false)
    }
  }

  const handleCommentUpdate = async (commentId: number, text: string) => {
    if (!commentService) return

    setIsCreatingComment(true)
    try {
      const updatedComment = await commentService.updateComment({
        commentId,
        text,
      })

      setComments((prev) => prev.map((comment) => (comment.id === commentId ? updatedComment : comment)))
      setEditingComment(null)
      setIsCommentModalOpen(false)
      setActiveCommentId(null)
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("Failed to update comment")
    } finally {
      setIsCreatingComment(false)
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    if (!commentService) return

    setDeletingCommentId(commentId)
    try {
      await commentService.deleteComment(commentId)
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      setActiveCommentId(null)
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Failed to delete comment")
    } finally {
      setDeletingCommentId(null)
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

  const handleCommentClick = (commentId: number) => {
    setActiveCommentId(activeCommentId === commentId ? null : commentId)
  }

  const handleCommentModalClose = () => {
    setIsCommentModalOpen(false)
    setTempAnnotation(null)
    setEditingComment(null)
    setHasTextSelection(false)
    // Clear any text selection
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }

  const handleReply = async (parentId: number, text: string) => {
    if (!document || !commentService) return

    setReplyingToCommentId(parentId)
    try {
      const response = await commentService.createReply({
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
        }),
      )
      toast.success("Reply added successfully")
    } catch (error) {
      console.error("Error creating reply:", error)
      toast.error("Failed to add reply")
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
    if (!commentService) return

    setDeletingReplyId(replyId)
    try {
      await commentService.deleteComment(replyId)
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          children: comment.children?.filter((child) => child.id !== replyId) || [],
        })),
      )
      toast.success("Reply deleted successfully")
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast.error("Failed to delete reply")
    } finally {
      setDeletingReplyId(null)
    }
  }

  // PDF navigation
  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number
  }): void => {
    setNumPages(nextNumPages)
  }

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => numPages && setCurrentPage((prev) => Math.min(prev + 1, numPages))
  const zoomIn = () => setPdfScale((prev) => Math.min(prev + 0.2, 3.0))
  const zoomOut = () => setPdfScale((prev) => Math.max(prev - 0.2, 0.5))

  if (!isOpen) return null

  const allAnnotations: CommentAnnotation[] = [
    ...comments.map((c) => c.annotation),
    ...(tempAnnotation ? [tempAnnotation] : []),
  ]

  const currentPageComments = comments.filter((comment) => comment.annotation.page === currentPage)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-secondary flex h-full w-full max-w-7xl flex-col shadow-xl">
        {/* Header */}
        <PDFHeader
          document={document}
          isLoadingComments={isLoadingComments}
          hasTextSelection={hasTextSelection}
          onClose={onClose}
          onShareClick={onShareClick}
          onDownloadClick={onDownloadClick}
          onMoveClick={onMoveClick}
          onEditClick={handleEditClick}
          onCommentClick={handleCommentIconClick}
        />

        {/* PDF Content */}
        <div className="relative flex-1 overflow-auto bg-gray-100 p-6" onMouseUp={handleMouseUp}>
          {/* Floating Controls */}
          <PDFControls
            currentPage={currentPage}
            numPages={numPages}
            pdfScale={pdfScale}
            onPrevPage={goToPrevPage}
            onNextPage={goToNextPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />

          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading PDF document...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="mx-auto max-w-4xl">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
                loading={<div className="p-8 text-center">Loading document...</div>}
              >
                <div ref={pageRef} className="relative bg-white shadow-lg">
                  <Page key={`page_${currentPage}`} pageNumber={currentPage} scale={pdfScale} renderTextLayer={true} />

                  {/* Annotations overlay */}
                  <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                    {allAnnotations
                      .filter((anno) => anno.page === currentPage)
                      .map((anno) => (
                        <Annotation
                          key={anno.id}
                          annotation={anno}
                          isHighlighted={comments.some((c) => c.annotation.id === anno.id)}
                        />
                      ))}
                  </div>

                  {/* Comment markers */}
                  <div className="absolute top-0 left-0 h-full w-full">
                    {currentPageComments.map((comment) => (
                      <div key={comment.id} className="comment-marker">
                        <CommentMarker
                          comment={comment}
                          onClick={() => handleCommentClick(comment.id)}
                          onEdit={() => handleCommentEdit(comment)}
                          onDelete={() => handleCommentDelete(comment.id)}
                          onReply={handleReply}
                          onEditReply={handleEditReply}
                          onDeleteReply={handleDeleteReply}
                          isDeleting={deletingCommentId === comment.id}
                          isActive={activeCommentId === comment.id}
                          isReplying={replyingToCommentId === comment.id}
                          deletingReplyId={deletingReplyId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Failed to load PDF</p>
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
  )
}
