"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Document as DocumentType } from "@/types/document.types"
import { clsx } from "clsx"
import { ChevronLeft, ChevronRight, Edit3, Loader2, MessageSquare, Search, Trash2, X } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import { CommentService, type Comment, type CommentAnnotation } from "../doc_utils/comment.services"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

interface User {
  id: string
  name: string
}

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentType | null
  apiClient: any
}

// Utility function
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Mock users data
const mockUsers: User[] = [
  { id: "user-1", name: "Ada Lovelace" },
  { id: "user-2", name: "Grace Hopper" },
  { id: "user-3", name: "Margaret Hamilton" },
  { id: "user-4", name: "Katherine Johnson" },
]

// Sub-components
interface MentionSuggestionsProps {
  suggestions: User[]
  onSelect: (user: User) => void
  activeIndex: number
}

const MentionSuggestions: FC<MentionSuggestionsProps> = ({ suggestions, onSelect, activeIndex }) => {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-20 overflow-hidden">
      <ul className="max-h-40 overflow-y-auto">
        {suggestions.map((user, index) => (
          <li
            key={user.id}
            className={cn("px-4 py-2 cursor-pointer hover:bg-gray-100", { "bg-gray-200": index === activeIndex })}
            onMouseDown={(e: MouseEvent) => {
              e.preventDefault()
              onSelect(user)
            }}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string) => void
  position: { x: number; y: number }
  users: User[]
  isLoading?: boolean
  editingComment?: Comment | null
  onUpdate?: (commentId: number, text: string) => void
}

const CommentModal: FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  position,
  users,
  isLoading = false,
  editingComment = null,
}) => {
  const [commentText, setCommentText] = useState("")
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCommentText(editingComment?.text || "")
      setMentionSuggestions([])
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, editingComment])

  const handleCommentTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCommentText(text)

    const cursorPos = e.target.selectionStart
    const textUpToCursor = text.substring(0, cursorPos)
    const mentionMatch = textUpToCursor.match(/@([\w\s]*)$/)

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionSuggestions(users.filter((u) => u.name.toLowerCase().includes(query)))
      setActiveSuggestionIndex(0)
    } else {
      setMentionSuggestions([])
    }
  }

  const handleSelectMention = (user: User) => {
    if (!textareaRef.current) return

    const currentText = textareaRef.current.value
    const cursorPos = textareaRef.current.selectionStart

    const atIndex = currentText.slice(0, cursorPos).lastIndexOf("@")
    const textBefore = currentText.substring(0, atIndex)
    const textAfter = currentText.substring(cursorPos)
    const newText = `${textBefore}@${user.name} ${textAfter}`

    setCommentText(newText)
    setMentionSuggestions([])

    setTimeout(() => {
      textareaRef.current?.focus()
      const newCursorPos = (textBefore + `@${user.name} `).length
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev + 1) % mentionSuggestions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[activeSuggestionIndex])
      } else if (e.key === "Escape") {
        setMentionSuggestions([])
      }
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      if (editingComment && onUpdate) {
        onUpdate(editingComment.id, commentText)
      } else {
        onSubmit(commentText)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <Card
        className="absolute bg-white shadow-xl border-0 w-80"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 200),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <MentionSuggestions
                suggestions={mentionSuggestions}
                onSelect={handleSelectMention}
                activeIndex={activeSuggestionIndex}
              />
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleCommentTextChange}
                onKeyDown={handleKeyDown}
                placeholder={editingComment ? "Edit comment..." : "Add a comment..."}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none text-sm"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!commentText.trim() || isLoading}>
                {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                {editingComment ? "Update" : "Comment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

interface CommentMarkerProps {
  comment: Comment
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
  isActive?: boolean
}

const CommentMarker: FC<CommentMarkerProps> = ({
  comment,
  onClick,
  onEdit,
  onDelete,
  isDeleting = false,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="absolute cursor-pointer z-10"
      style={{
        left: `${comment.annotation.rect.x + comment.annotation.rect.width}%`,
        top: `${comment.annotation.rect.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Avatar className={cn("h-6 w-6 border-2 border-white shadow-md", isActive && "ring-2 ring-blue-500")}>
        <AvatarFallback className="text-xs bg-blue-500 text-white">
          {comment.authorName?.charAt(0).toUpperCase() || comment.author.toString().charAt(0)}
        </AvatarFallback>
      </Avatar>

      {(isHovered || isActive) && (
        <Card className="absolute left-8 top-0 w-64 bg-white shadow-xl border-0 z-20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-gray-500 text-white">
                  {comment.authorName?.charAt(0).toUpperCase() || comment.author.toString().charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.authorName || `User ${comment.author}`}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{comment.text}</p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface AnnotationProps {
  annotation: CommentAnnotation
  isHighlighted?: boolean
}

const Annotation: FC<AnnotationProps> = ({ annotation, isHighlighted = false }) => (
  <div
    className={cn(
      "absolute pointer-events-none",
      isHighlighted ? "bg-yellow-200 bg-opacity-60" : "bg-yellow-400 bg-opacity-40",
    )}
    style={{
      left: `${annotation.rect.x}%`,
      top: `${annotation.rect.y}%`,
      width: `${annotation.rect.width}%`,
      height: `${annotation.rect.height}%`,
    }}
  />
)

export function PDFPreviewModal({ isOpen, onClose, document, apiClient }: PDFPreviewModalProps) {
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
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)

  // Comment modal state
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [commentModalPosition, setCommentModalPosition] = useState({ x: 0, y: 0 })
  const [editingComment, setEditingComment] = useState<Comment | null>(null)

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

  // Cleanup URL when modal closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  // Reset state when modal closes
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
    }
  }, [isOpen])

  // Close active comment when clicking outside
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

  // Text selection and annotation logic
  const handleMouseUp = (e: MouseEvent): void => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return

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
      setCommentModalPosition({ x: e.clientX, y: e.clientY })
      setEditingComment(null)
      setActiveCommentId(null)
      setIsCommentModalOpen(true)
    }

    selection.removeAllRanges()
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
    setCommentModalPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
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
  }

  // PDF navigation
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }): void => {
    setNumPages(nextNumPages)
  }

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => numPages && setCurrentPage((prev) => Math.min(prev + 1, numPages))

  if (!isOpen) return null

  const allAnnotations: CommentAnnotation[] = [
    ...comments.map((c) => c.annotation),
    ...(tempAnnotation ? [tempAnnotation] : []),
  ]

  const currentPageComments = comments.filter((comment) => comment.annotation.page === currentPage)

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">PDF</div>
            <h2 className="text-xl font-semibold text-gray-800">{document?.name || "PDF Preview"}</h2>
            {isLoadingComments && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading comments...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Controls */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} / {numPages || "--"}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!numPages || currentPage >= numPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Search size={16} className="text-gray-400" />
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={pdfScale}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPdfScale(Number.parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 min-w-[45px]">{Math.round(pdfScale * 100)}%</span>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6" onMouseUp={handleMouseUp}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading PDF document...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="max-w-4xl mx-auto">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
                loading={<div className="text-center p-8">Loading document...</div>}
              >
                <div ref={pageRef} className="relative shadow-lg bg-white">
                  <Page key={`page_${currentPage}`} pageNumber={currentPage} scale={pdfScale} renderTextLayer={true} />

                  {/* Annotations overlay */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
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
                  <div className="absolute top-0 left-0 w-full h-full">
                    {currentPageComments.map((comment) => (
                      <div key={comment.id} className="comment-marker">
                        <CommentMarker
                          comment={comment}
                          onClick={() => handleCommentClick(comment.id)}
                          onEdit={() => handleCommentEdit(comment)}
                          onDelete={() => handleCommentDelete(comment.id)}
                          isDeleting={deletingCommentId === comment.id}
                          isActive={activeCommentId === comment.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
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
