"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { Document as DocumentType } from "@/types/document.types"
import { clsx } from "clsx"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Info,
  MessageSquare,
  Share,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
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
import { twMerge } from "tailwind-merge"

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

// Type definitions
interface User {
  id: string
  name: string
}

interface AnnotationRect {
  x: number
  y: number
  width: number
  height: number
}

interface AnnotationType {
  id: string
  page: number
  rect: AnnotationRect
}

interface CommentType {
  id: string
  text: string
  author: string
  timestamp: string
  annotation: AnnotationType
}

interface PdfPreviewModalProps {
  document: DocumentType | null
  isOpen: boolean
  onClose: () => void
  apiClient: any
  onEditClick?: (document: DocumentType) => void
  onShareClick?: (document: DocumentType) => void
  onDownloadClick?: (document: DocumentType) => void
  onInfoClick?: (document: DocumentType) => void
}

// Utility function
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Mock data for users and comments
const mockUsers: User[] = [
  { id: "user-1", name: "Ada Lovelace" },
  { id: "user-2", name: "Grace Hopper" },
  { id: "user-3", name: "Margaret Hamilton" },
  { id: "user-4", name: "Katherine Johnson" },
]

const mockComments: CommentType[] = [
  // {
  //   id: "comment-1",
  //   text: "This is a great point about the document structure. @Ada Lovelace what are your thoughts?",
  //   author: "Demo User",
  //   timestamp: new Date().toISOString(),
  //   annotation: {
  //     id: "anno-1",
  //     page: 1,
  //     rect: { x: 15, y: 25, width: 70, height: 5 },
  //   },
  // },
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

interface CommentProps {
  comment: CommentType
  onSelect: (comment: CommentType) => void
  isSelected: boolean
}

const Comment: FC<CommentProps> = ({ comment, onSelect, isSelected }) => (
  <div
    className={cn(
      "p-3 border-b border-gray-200 cursor-pointer transition-colors duration-200",
      isSelected ? "bg-blue-50" : "hover:bg-gray-50",
    )}
    onClick={() => onSelect(comment)}
  >
    <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.text}</p>
    <div className="text-xs text-gray-500 mt-2 flex justify-between">
      <span>{comment.author}</span>
      <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
    </div>
  </div>
)

interface AnnotationProps {
  annotation: AnnotationType
  onClick: (id: string) => void
  isSelected: boolean
}

const Annotation: FC<AnnotationProps> = ({ annotation, onClick, isSelected }) => (
  <div
    key={annotation.id}
    className={cn(
      "absolute bg-yellow-400 bg-opacity-40 cursor-pointer border-2 border-transparent hover:border-yellow-500 pointer-events-auto",
      { "border-yellow-600 bg-opacity-60": isSelected },
    )}
    style={{
      left: `${annotation.rect.x}%`,
      top: `${annotation.rect.y}%`,
      width: `${annotation.rect.width}%`,
      height: `${annotation.rect.height}%`,
    }}
    onClick={(e: MouseEvent) => {
      e.stopPropagation()
      onClick(annotation.id)
    }}
  />
)

export function PdfPreviewModal({
  document,
  isOpen,
  onClose,
  apiClient,
  onEditClick,
  onShareClick,
  onDownloadClick,
  onInfoClick,
}: PdfPreviewModalProps) {
  // PDF and data state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pdfScale, setPdfScale] = useState<number>(1.2)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Comments and annotations state
  const [comments, setComments] = useState<CommentType[]>(mockComments)
  const [users] = useState<User[]>(mockUsers)
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [tempAnnotation, setTempAnnotation] = useState<AnnotationType | null>(null)

  // Comment form state
  const [commentText, setCommentText] = useState<string>("")
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0)

  // Refs
  const pageRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commentSidebarRef = useRef<HTMLDivElement>(null)

  // Fetch PDF when document changes
  useEffect(() => {
    if (!document || !isOpen) {
      setPdfUrl(null)
      setError(null)
      return
    }

    const fetchPdf = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get(`/dashboard/documents/view/${document.id}`, {
          responseType: "blob",
        })

        const pdfBlob = response.data
        const objectUrl = URL.createObjectURL(pdfBlob)
        setPdfUrl(objectUrl)
      } catch (error: any) {
        console.error("Error fetching PDF:", error)
        const errorMessage = error.response?.data?.message || error.message || "Failed to load PDF document"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdf()

    // Cleanup function to revoke object URL
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [document, isOpen, apiClient])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1)
      setActiveAnnotation(null)
      setTempAnnotation(null)
      setCommentText("")
      setMentionSuggestions([])
    }
  }, [isOpen])

  // Annotation logic
  const handleMouseUp = (): void => {
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
      const newAnnotation: AnnotationType = {
        id: `temp-${Date.now()}`,
        page: currentPage,
        rect: { x, y, width, height },
      }

      setTempAnnotation(newAnnotation)
      setActiveAnnotation(newAnnotation.id)
      textareaRef.current?.focus()
    }

    selection.removeAllRanges()
  }

  // Comment and mention logic
  const handleCommentSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!commentText.trim() || !activeAnnotation) return

    const annotationForComment =
      tempAnnotation ?? comments.find((c) => c.annotation.id === activeAnnotation)?.annotation
    if (!annotationForComment) return

    const newComment: CommentType = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: "Demo User",
      timestamp: new Date().toISOString(),
      annotation: annotationForComment,
    }

    setComments((prev) => [...prev, newComment])
    setCommentText("")
    setTempAnnotation(null)
    setActiveAnnotation(null)
  }

  const handleCommentTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
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

  const handleSelectMention = (user: User): void => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
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

  const selectComment = (comment: CommentType): void => {
    setCurrentPage(comment.annotation.page)
    setActiveAnnotation(comment.annotation.id)
    setTimeout(() => {
      if (commentSidebarRef.current) {
        commentSidebarRef.current.scrollTop = commentSidebarRef.current.scrollHeight
      }
    }, 100)
  }

  // PDF navigation
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }): void => {
    setNumPages(nextNumPages)
  }

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => numPages && setCurrentPage((prev) => Math.min(prev + 1, numPages))

  const zoomIn = () => setPdfScale((prev) => Math.min(prev + 0.2, 3))
  const zoomOut = () => setPdfScale((prev) => Math.max(prev - 0.2, 0.5))

  if (!document) return null

  const allAnnotations: AnnotationType[] = [
    ...comments.map((c) => c.annotation),
    ...(tempAnnotation ? [tempAnnotation] : []),
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-gray-900">
        <div className="flex h-full">
          {/* Main PDF Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">PDF</span>
                </div>
                <h1 className="text-lg font-semibold">{document.name}</h1>
              </div>

              <div className="flex items-center gap-2">
                {onEditClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-700"
                    onClick={() => onEditClick(document)}
                  >
                    <Edit size={18} />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                  <Eye size={18} />
                </Button>
                {onDownloadClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-700"
                    onClick={() => onDownloadClick(document)}
                  >
                    <Download size={18} />
                  </Button>
                )}
                {onShareClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-700"
                    onClick={() => onShareClick(document)}
                  >
                    <Share size={18} />
                  </Button>
                )}
                {onInfoClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-gray-700"
                    onClick={() => onInfoClick(document)}
                  >
                    <Info size={18} />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" onClick={onClose}>
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 bg-gray-100 overflow-auto" onMouseUp={handleMouseUp}>
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading PDF document...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">Error loading PDF</p>
                    <p className="mt-2">{error}</p>
                  </div>
                </div>
              )}

              {pdfUrl && !isLoading && !error && (
                <div className="p-4">
                  <div className="max-w-4xl mx-auto">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => {
                        console.error("PDF load error:", error)
                        setError("Failed to load PDF document")
                      }}
                      loading={<div className="text-center p-8">Loading document...</div>}
                    >
                      <div ref={pageRef} className="relative shadow-lg bg-white">
                        <Page
                          key={`page_${currentPage}`}
                          pageNumber={currentPage}
                          scale={pdfScale}
                          renderTextLayer={true}
                        />
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          {allAnnotations
                            .filter((anno) => anno.page === currentPage)
                            .map((anno) => (
                              <Annotation
                                key={anno.id}
                                annotation={anno}
                                onClick={() => setActiveAnnotation(anno.id)}
                                isSelected={activeAnnotation === anno.id}
                              />
                            ))}
                        </div>
                      </div>
                    </Document>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                  className="text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </Button>
                <span>
                  Page {currentPage} of {numPages || "--"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={!numPages || currentPage >= numPages}
                  className="text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={zoomOut} className="text-white hover:bg-gray-700">
                  <ZoomOut size={18} />
                </Button>
                <span className="text-sm">{Math.round(pdfScale * 100)}%</span>
                <Button variant="ghost" size="icon" onClick={zoomIn} className="text-white hover:bg-gray-700">
                  <ZoomIn size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-600" />
                Comments
              </h2>
            </div>

            <div ref={commentSidebarRef} className="flex-1 overflow-y-auto">
              {comments.length > 0 ? (
                comments
                  .sort((a, b) => a.annotation.page - b.annotation.page || a.annotation.rect.y - b.annotation.rect.y)
                  .map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onSelect={selectComment}
                      isSelected={activeAnnotation === comment.annotation.id}
                    />
                  ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No comments yet.</p>
                  <p className="text-sm mt-2">Select text on the PDF to start a new comment.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={handleCommentSubmit}>
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
                    placeholder={activeAnnotation ? "Add a comment..." : "Select text to comment"}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    rows={4}
                    disabled={!activeAnnotation}
                  />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  {tempAnnotation && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempAnnotation(null)
                        setActiveAnnotation(null)
                        setCommentText("")
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={!commentText.trim() || !activeAnnotation}>
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
