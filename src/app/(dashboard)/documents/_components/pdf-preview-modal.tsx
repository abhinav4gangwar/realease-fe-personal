'use client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Document as DocumentType } from '@/types/document.types'
import { clsx } from 'clsx'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FolderInput,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { HiShare } from 'react-icons/hi2'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import {
  CommentService,
  type Comment,
  type CommentAnnotation,
} from '../doc_utils/comment.services'
import { FileIcon } from './file-icon'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface User {
  id: string
  name: string
}

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentType | null
  apiClient: any
  onEditClick?: (document: Document) => void
  onMoveClick?: (document: Document) => void
  onShareClick?: (document: Document) => void
  onDownloadClick?: (document: Document) => void
}

// Utility function
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Mock users data
const mockUsers: User[] = [
  { id: 'user-1', name: 'Ada Lovelace' },
  { id: 'user-2', name: 'Grace Hopper' },
  { id: 'user-3', name: 'Margaret Hamilton' },
  { id: 'user-4', name: 'Katherine Johnson' },
]

// Sub-components
interface MentionSuggestionsProps {
  suggestions: User[]
  onSelect: (user: User) => void
  activeIndex: number
}

const MentionSuggestions: FC<MentionSuggestionsProps> = ({
  suggestions,
  onSelect,
  activeIndex,
}) => {
  if (suggestions.length === 0) return null

  return (
    <div className="absolute bottom-full z-20 mb-2 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl">
      <ul className="max-h-40 overflow-y-auto">
        {suggestions.map((user, index) => (
          <li
            key={user.id}
            className={cn('cursor-pointer px-4 py-2 hover:bg-gray-100', {
              'bg-gray-200': index === activeIndex,
            })}
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
  const [commentText, setCommentText] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCommentText(editingComment?.text || '')
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
      setMentionSuggestions(
        users.filter((u) => u.name.toLowerCase().includes(query))
      )
      setActiveSuggestionIndex(0)
    } else {
      setMentionSuggestions([])
    }
  }

  const handleSelectMention = (user: User) => {
    if (!textareaRef.current) return

    const currentText = textareaRef.current.value
    const cursorPos = textareaRef.current.selectionStart
    const atIndex = currentText.slice(0, cursorPos).lastIndexOf('@')
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
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) => (prev + 1) % mentionSuggestions.length
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) =>
            (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[activeSuggestionIndex])
      } else if (e.key === 'Escape') {
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
        className="absolute w-80 border-0 bg-white shadow-xl"
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
                placeholder={
                  editingComment ? 'Edit comment...' : 'Add a comment...'
                }
                className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm transition"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={!commentText.trim() || isLoading}
              >
                {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {editingComment ? 'Update' : 'Comment'}
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
  onReply: (parentId: number, text: string) => void
  isDeleting?: boolean
  isActive?: boolean
  isReplying?: boolean
}

const CommentMarker: FC<CommentMarkerProps> = ({
  comment,
  onClick,
  onEdit,
  onDelete,
  onReply,
  isDeleting = false,
  isActive = false,
  isReplying = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const replyInputRef = useRef<HTMLInputElement>(null)

  const handleReplyTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setReplyText(text)

    const cursorPos = e.target.selectionStart || 0
    const textUpToCursor = text.substring(0, cursorPos)
    const mentionMatch = textUpToCursor.match(/@([\w\s]*)$/)

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionSuggestions(
        mockUsers.filter((u) => u.name.toLowerCase().includes(query))
      )
      setActiveSuggestionIndex(0)
    } else {
      setMentionSuggestions([])
    }
  }

  const handleSelectMention = (user: User) => {
    if (!replyInputRef.current) return

    const currentText = replyInputRef.current.value
    const cursorPos = replyInputRef.current.selectionStart || 0
    const atIndex = currentText.slice(0, cursorPos).lastIndexOf('@')
    const textBefore = currentText.substring(0, atIndex)
    const textAfter = currentText.substring(cursorPos)
    const newText = `${textBefore}@${user.name} ${textAfter}`

    setReplyText(newText)
    setMentionSuggestions([])

    setTimeout(() => {
      replyInputRef.current?.focus()
      const newCursorPos = (textBefore + `@${user.name} `).length
      replyInputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleReplyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) => (prev + 1) % mentionSuggestions.length
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestionIndex(
          (prev) =>
            (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length
        )
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[activeSuggestionIndex])
      } else if (e.key === 'Escape') {
        setMentionSuggestions([])
      }
    } else if (e.key === 'Enter' && replyText.trim()) {
      e.preventDefault()
      handleReplySubmit()
    }
  }

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText)
      setReplyText('')
      setMentionSuggestions([])
    }
  }

  return (
    <div
      className="absolute z-10 cursor-pointer"
      style={{
        left: `${comment.annotation.rect.x + comment.annotation.rect.width}%`,
        top: `${comment.annotation.rect.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Avatar
        className={cn(
          'h-7 w-7 border-2 border-white shadow-md',
          isActive && 'ring-secondary ring-2'
        )}
      >
        <AvatarFallback className="bg-secondary text-xs text-white">
          {comment.authorName?.charAt(0).toUpperCase() ||
            comment.author.toString().charAt(0)}
        </AvatarFallback>
      </Avatar>
      {(isHovered || isActive) && (
        <Card className="absolute top-0 left-8 z-20 max-w-5xl border-0 bg-white shadow-xl">
          <CardContent className="max-w-5xl p-3">
            <div className="flex items-start gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-xs text-white">
                  {comment.authorName?.charAt(0).toUpperCase() ||
                    comment.author.toString().charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-1 flex justify-between">
                  <div className="text-md font-semibold">
                    {comment.authorName || `User ${comment.author}`}
                    <p className="text-xs font-medium text-gray-500">
                      {comment.timestamp}
                    </p>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary h-4 cursor-pointer px-2 text-xs text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                      }}
                    >
                      <Pencil className="mr-1 h-2 w-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary h-4 cursor-pointer px-2 text-xs text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="m-2 w-[300px]">
              <p className="text-secondary text-sm">{comment.text}</p>

              {/* Display replies */}
              {comment.children && comment.children.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                  {comment.children.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gray-400 text-xs text-white">
                          {reply.authorName?.charAt(0).toUpperCase() ||
                            reply.author.toString().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex-col items-center gap-2">
                          <p className="text-xs font-medium">
                            {reply.authorName || `User ${reply.author}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reply.timestamp}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isActive && (
                <div className="pt-4">
                  <div className="relative">
                    {mentionSuggestions.length > 0 && (
                      <div className="absolute bottom-full z-30 mb-2 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl">
                        <ul className="max-h-32 overflow-y-auto">
                          {mentionSuggestions.map((user, index) => (
                            <li
                              key={user.id}
                              className={cn(
                                'cursor-pointer px-3 py-1 text-xs hover:bg-gray-100',
                                {
                                  'bg-gray-200':
                                    index === activeSuggestionIndex,
                                }
                              )}
                              onMouseDown={(e: MouseEvent) => {
                                e.preventDefault()
                                handleSelectMention(user)
                              }}
                            >
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex-col">
                      <Input
                        ref={replyInputRef}
                        className="h-8 text-xs"
                        placeholder="Mention user with @"
                        value={replyText}
                        onChange={handleReplyTextChange}
                        onKeyDown={handleReplyKeyDown}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        disabled={isReplying}
                      />
                      <div className="flex gap-3 mt-3">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                        <Button
                          className=" cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReplySubmit()
                          }}
                          disabled={!replyText.trim() || isReplying}
                        >
                          {isReplying ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span>Reply</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

const Annotation: FC<AnnotationProps> = ({
  annotation,
  isHighlighted = false,
}) => (
  <div
    className={cn(
      'pointer-events-none absolute',
      isHighlighted ? 'bg-blue-300/40' : 'bg-blue-300/50'
    )}
    style={{
      left: `${annotation.rect.x}%`,
      top: `${annotation.rect.y}%`,
      width: `${annotation.rect.width}%`,
      height: `${annotation.rect.height}%`,
    }}
  />
)

export function PDFPreviewModal({
  isOpen,
  onClose,
  document,
  apiClient,
  onMoveClick,
  onShareClick,
  onDownloadClick,
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
  const [tempAnnotation, setTempAnnotation] =
    useState<CommentAnnotation | null>(null)
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false)
  const [isCreatingComment, setIsCreatingComment] = useState<boolean>(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  )
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null
  )

  // Comment modal state
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [commentModalPosition, setCommentModalPosition] = useState({
    x: 0,
    y: 0,
  })
  const [editingComment, setEditingComment] = useState<Comment | null>(null)

  // Services
  const [commentService, setCommentService] = useState<CommentService | null>(
    null
  )

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
      const response = await apiClient.get(
        `/dashboard/documents/view/${document.id}`,
        {
          responseType: 'blob',
        }
      )
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      const objectUrl = URL.createObjectURL(pdfBlob)
      setPdfUrl(objectUrl)
    } catch (error) {
      console.error('Error loading PDF:', error)
      toast.error('Failed to load PDF document')
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    if (!document || !commentService) return

    setIsLoadingComments(true)
    try {
      const fetchedComments = await commentService.getComments(
        Number.parseInt(document.id)
      )
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Failed to load comments')
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
      setReplyingToCommentId(null)
    }
  }, [isOpen])

  // Close active comment when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const target = e.target as Element
      if (activeCommentId && !target?.closest('.comment-marker')) {
        setActiveCommentId(null)
      }
    }

    if (activeCommentId) {
      window.document.addEventListener('click', handleClickOutside)
      return () =>
        window.document.removeEventListener('click', handleClickOutside)
    }
  }, [activeCommentId])

  // Text selection and annotation logic
  const handleMouseUp = (e: MouseEvent): void => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return

    const range = selection.getRangeAt(0)
    const pageContent = pageRef.current?.querySelector(
      '.react-pdf__Page__textContent'
    )
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
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Failed to add comment')
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

  const handleCommentDelete = async (commentId: number) => {
    if (!commentService) return

    setDeletingCommentId(commentId)
    try {
      await commentService.deleteComment(commentId)
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
  }

  const handleReply = async (parentId: number, text: string) => {
    if (!document || !commentService) return

    setReplyingToCommentId(parentId)
    try {
      const newReply = await commentService.createReply({
        text,
        documentId: Number.parseInt(document.id),
        parentId,
      })

      // Update the comments state to include the new reply
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              children: [...(comment.children || []), newReply],
            }
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

  // PDF navigation
  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number
  }): void => {
    setNumPages(nextNumPages)
  }

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () =>
    numPages && setCurrentPage((prev) => Math.min(prev + 1, numPages))

  if (!isOpen) return null

  const allAnnotations: CommentAnnotation[] = [
    ...comments.map((c) => c.annotation),
    ...(tempAnnotation ? [tempAnnotation] : []),
  ]

  const currentPageComments = comments.filter(
    (comment) => comment.annotation.page === currentPage
  )

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-secondary flex h-full w-full max-w-7xl flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex h-12 items-center gap-3">
            <FileIcon type={document?.icon || ''} />
            <h2 className="text-lg font-semibold text-white">
              {document?.name || 'PDF Preview'}
            </h2>
            {isLoadingComments && (
              <div className="flex items-center gap-2 text-sm text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading comments...
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-6 w-6 cursor-pointer text-white"
              onClick={(e) => {
                e.stopPropagation()
                if (onShareClick) {
                  onShareClick(document)
                }
              }}
            >
              <HiShare className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-6 w-6 cursor-pointer text-white"
              onClick={(e) => {
                e.stopPropagation()
                if (onDownloadClick) {
                  onDownloadClick(document)
                }
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-6 w-6 cursor-pointer text-white"
              onClick={(e) => {
                e.stopPropagation()
                if (onMoveClick) {
                  onMoveClick(document)
                }
              }}
            >
              <FolderInput className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:text-primary h-6 w-6 cursor-pointer text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} / {numPages || '--'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!numPages || currentPage >= numPages}
            >
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPdfScale(Number.parseFloat(e.target.value))
              }
              className="w-24"
            />
            <span className="min-w-[45px] text-sm text-gray-600">
              {Math.round(pdfScale * 100)}%
            </span>
          </div>
        </div>

        {/* PDF Content */}
        <div
          className="flex-1 overflow-auto bg-gray-100 p-6"
          onMouseUp={handleMouseUp}
        >
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
                loading={
                  <div className="p-8 text-center">Loading document...</div>
                }
              >
                <div ref={pageRef} className="relative bg-white shadow-lg">
                  <Page
                    key={`page_${currentPage}`}
                    pageNumber={currentPage}
                    scale={pdfScale}
                    renderTextLayer={true}
                  />
                  {/* Annotations overlay */}
                  <div className="pointer-events-none absolute top-0 left-0 h-full w-full">
                    {allAnnotations
                      .filter((anno) => anno.page === currentPage)
                      .map((anno) => (
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
                    {currentPageComments.map((comment) => (
                      <div key={comment.id} className="comment-marker">
                        <CommentMarker
                          comment={comment}
                          onClick={() => handleCommentClick(comment.id)}
                          onEdit={() => handleCommentEdit(comment)}
                          onDelete={() => handleCommentDelete(comment.id)}
                          onReply={handleReply}
                          isDeleting={deletingCommentId === comment.id}
                          isActive={activeCommentId === comment.id}
                          isReplying={replyingToCommentId === comment.id}
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
