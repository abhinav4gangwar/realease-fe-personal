'use client'
import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
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
import { Comment, Properties, SharedUser } from '@/types/property.types'
import { apiClient } from '@/utils/api'
import {
  Bell,
  ChevronDown,
  Edit2,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from '../../documents/_components/file-icon'
import { formatCurrency } from '../_property_utils'
import FullMapModal from './map-model'
import MiniMap from './minimap'
import { CustomField } from './properties-edit-model'

export interface PropertiesDetailsModelProps {
  property: Properties | null
  isOpen: boolean
  onClose: () => void
  onEditClick?: (property: Properties) => void
}

const extractUsername = (email: string) => {
  return email.split('@')[0]
}

const PropertiesDetailsModel = ({
  property,
  isOpen,
  onClose,
  onEditClick,
}: PropertiesDetailsModelProps) => {
  const [openItems, setOpenItems] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])

  // Comment states
  const [comments, setComments] = useState<Comment[]>([])
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingToId, setReplyingToId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({})
  const [showMentions, setShowMentions] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [mentionQuery, setMentionQuery] = useState<{ [key: string]: string }>(
    {}
  )
  const [cursorPosition, setCursorPosition] = useState<{
    [key: string]: number
  }>({})
  const [filteredUsers, setFilteredUsers] = useState<{
    [key: string]: SharedUser[]
  }>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null)

  // Collapsible threads: any comment with children can be collapsed
  const [openThreads, setOpenThreads] = useState<Set<number>>(new Set())

  const toggleThread = (commentId: number) => {
    setOpenThreads((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  const uploadedDocuments = property?.documents

  const handleMiniMapClick = () => {
    setIsMapModalOpen(true)
  }

  const handleCommentChange = (value: string, inputKey = 'main') => {
    if (inputKey === 'main') {
      setNewComment(value)
    } else {
      setReplyText((prev) => ({ ...prev, [inputKey]: value }))
    }

    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1)
      const spaceIndex = textAfterAt.indexOf(' ')
      const query =
        spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex)

      if (spaceIndex === -1) {
        setMentionQuery((prev) => ({ ...prev, [inputKey]: query }))
        setShowMentions((prev) => ({ ...prev, [inputKey]: true }))
        setCursorPosition((prev) => ({ ...prev, [inputKey]: lastAtIndex }))

        const filtered = sharedUsers.filter((user) =>
          extractUsername(user.email)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        setFilteredUsers((prev) => ({ ...prev, [inputKey]: filtered }))
      } else {
        setShowMentions((prev) => ({ ...prev, [inputKey]: false }))
      }
    } else {
      setShowMentions((prev) => ({ ...prev, [inputKey]: false }))
    }
  }

  const selectMention = (user: SharedUser, inputKey = 'main') => {
    const username = extractUsername(user.email)
    const currentText =
      inputKey === 'main' ? newComment : replyText[inputKey] || ''
    const currentCursorPosition = cursorPosition[inputKey] || 0
    const currentMentionQuery = mentionQuery[inputKey] || ''

    const beforeAt = currentText.substring(0, currentCursorPosition)
    const afterMention = currentText.substring(
      currentCursorPosition + 1 + currentMentionQuery.length
    )
    const newText = `${beforeAt}@${username} ${afterMention}`

    if (inputKey === 'main') {
      setNewComment(newText)
    } else {
      setReplyText((prev) => ({ ...prev, [inputKey]: newText }))
    }

    setShowMentions((prev) => ({ ...prev, [inputKey]: false }))
    setMentionQuery((prev) => ({ ...prev, [inputKey]: '' }))
  }

  const handleMapModalClose = () => {
    setIsMapModalOpen(false)
  }

  const getCoordinatesForMap = () => {
    if (!property) return ''

    if ((property as any).latitude && (property as any).longitude) {
      const lat = parseFloat((property as any).latitude)
      const lng = parseFloat((property as any).longitude)

      if (!isNaN(lat) && !isNaN(lng)) {
        const latDir = lat >= 0 ? 'N' : 'S'
        const lngDir = lng >= 0 ? 'E' : 'W'
        return `${Math.abs(lat)} ${latDir}; ${Math.abs(lng)} ${lngDir}`
      }
    }

    return property.coordinates || ''
  }

  const getSingularUnit = (unit: string) => {
    const mappings: { [key: string]: string } = {
      acres: 'acre',
      hectares: 'hectare',
      'square yards': 'square yard',
      'square feet': 'square foot',
      'square meters': 'square meter',
      'sq.ft': 'square foot',
      sqm: 'square meter',
      sqyd: 'square yard',
    }
    const lower = unit.toLowerCase()
    return mappings[lower] || unit
  }

  const getUnitFromExtent = () => {
    if (!property?.extent) return 'unit'
    const match = property.extent.match(/(\d+(?:\.\d+)?)\s*(.*)$/)
    if (match) {
      const unitStr = match[2].trim()
      return getSingularUnit(unitStr)
    }
    return 'unit'
  }

  const loadUsers = async () => {
    if (!property?.id) return
    try {
      const response = await apiClient.get(
        `/dashboard/properties/getUsers/${property.id}`
      )
      setSharedUsers(response.data.users)
    } catch (error: any) {
      console.log(error)
    }
  }

  const loadComments = async () => {
    if (!property?.id) return
    setLoadingComments(true)
    try {
      const response = await apiClient.get(
        `/dashboard/properties/comments/list/${property.id}`
      )
      setComments(response.data.comments || [])
    } catch (error: any) {
      toast.error('Failed to load comments')
      console.error('Error loading comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !property?.id) return
    setIsSubmittingComment(true)
    try {
      const response = await apiClient.post(
        '/dashboard/properties/comments/create',
        {
          text: newComment,
          propertyId: property.id,
        }
      )
      setComments(response.data || [])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error: any) {
      toast.error('Failed to add comment')
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleAddReply = async (parentId: number, inputKey: string) => {
    const replyContent = replyText[inputKey]
    if (!replyContent?.trim() || !property?.id) return
    setIsSubmittingComment(true)
    try {
      const response = await apiClient.post(
        '/dashboard/properties/comments/create',
        {
          text: replyContent,
          propertyId: property.id,
          parentId,
        }
      )
      setComments(response.data || [])
      setReplyText((prev) => {
        const updated = { ...prev }
        delete updated[inputKey]
        return updated
      })
      setReplyingToId(null)
      toast.success('Reply added successfully')
    } catch (error: any) {
      toast.error('Failed to add reply')
      console.error('Error adding reply:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleUpdateComment = async (commentId: number) => {
    if (!editingText.trim()) return
    try {
      await apiClient.put('/dashboard/properties/comments/update', {
        text: editingText,
        commentId,
      })
      await loadComments()
      setEditingCommentId(null)
      setEditingText('')
      toast.success('Comment updated successfully')
    } catch (error: any) {
      toast.error('Failed to update comment')
      console.error('Error updating comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await apiClient.delete(
        `/dashboard/properties/comments/delete/${commentId}`
      )
      await loadComments()
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
      toast.success('Comment deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete comment')
      console.error('Error deleting comment:', error)
    }
  }

  const confirmDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingText(comment.text)
  }

  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="font-medium text-blue-400">
            {part}
          </span>
        )
      }
      return part
    })
  }

  // Updated: Collapsible threads at every level (including replies to replies)
  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const inputKey = `reply-${comment.id}`
    const hasReplies = comment.children && comment.children.length > 0
    const isThreadOpen = openThreads.has(comment.id)

    return (
      <div
        key={comment.id}
        className={`rounded-md border p-3 ${isReply ? 'ml-6 bg-gray-50' : 'bg-white'}`}
      >
        {/* EDIT MODE */}
        {editingCommentId === comment.id ? (
          <div className="space-y-2">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full resize-none rounded-md border p-2"
              rows={3}
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdateComment(comment.id)}
                disabled={!editingText.trim()}
              >
                Save
              </Button>
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* COMMENT HEADER */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="mb-2 text-sm text-gray-800">
                  {renderTextWithMentions(comment.text)}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Author: {comment.author}</span>
                  <span>•</span>
                  <span>{formatDate(comment.createdAt)}</span>

                  {/* Show/Hide replies for ANY comment with children */}
                  {hasReplies && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => toggleThread(comment.id)}
                        className="text-primary font-medium hover:underline"
                      >
                        {isThreadOpen
                          ? 'Hide replies'
                          : `Show replies (${comment.children!.length})`}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingToId(comment.id)}
                  className="h-6 w-6 p-0"
                >
                  <Reply className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(comment)}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => confirmDeleteComment(comment.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* COLLAPSIBLE REPLIES */}
            {hasReplies && isThreadOpen && (
              <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                {comment.children!.map((reply) =>
                  renderComment(reply, true, depth + 1)
                )}
              </div>
            )}

            {/* REPLY INPUT */}
            {replyingToId === comment.id && (
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <textarea
                    value={replyText[inputKey] || ''}
                    onChange={(e) =>
                      handleCommentChange(e.target.value, inputKey)
                    }
                    className="w-full resize-none rounded-md border p-2"
                    rows={2}
                    placeholder="Write a reply... You can use @mentions"
                  />
                  {showMentions[inputKey] &&
                    filteredUsers[inputKey]?.length > 0 && (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {filteredUsers[inputKey].map((user) => (
                          <div
                            key={user.id}
                            onClick={() => selectMention(user, inputKey)}
                            classState="cursor-pointer px-3 py-2 hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-secondary font-medium">
                                @{extractUsername(user.email)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({user.email})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddReply(comment.id, inputKey)}
                    disabled={
                      !replyText[inputKey]?.trim() || isSubmittingComment
                    }
                  >
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyingToId(null)
                      setReplyText((prev) => {
                        const upd = { ...prev }
                        delete upd[inputKey]
                        return upd
                      })
                      setShowMentions((prev) => {
                        const upd = { ...prev }
                        delete upd[inputKey]
                        return upd
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (property?.additionalDetails) {
      const customFieldsFromProperty = Object.entries(
        property.additionalDetails
      ).map(([key, value], index) => ({
        id: `custom-${index}`,
        label: key,
        value: String(value),
      }))
      setCustomFields(customFieldsFromProperty)
    }

    if (isOpen && property?.id) {
      loadComments()
      loadUsers()
    }
  }, [property, isOpen])

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[700px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h2 className="truncate pl-1 text-xl font-semibold">
                    Property Details
                  </h2>
                </div>
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button className="text-primary cursor-pointer rounded-full bg-white hover:text-white">
                    <Bell />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Legal Status */}
              <div className="flex justify-between gap-3">
                <div className="flex w-full justify-between rounded-md bg-[#F2F2F2] px-3 py-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Legal Status
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.isDisputed
                        ? property?.legalStatus
                        : 'Undisputed'}
                    </h2>
                    {property?.isDisputed && openItems && (
                      <div className="flex flex-col space-y-3 pt-3">
                        {[
                          'legalParties',
                          'caseNumber',
                          'caseType',
                          'nextHearing',
                        ].map((field) => (
                          <div key={field}>
                            <h3 className="mb-1 text-sm font-medium text-gray-500">
                              {field
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <h2 className="truncate text-lg font-semibold">
                              {(property as any)?.[field] || '-'}
                            </h2>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {property?.isDisputed && (
                    <div className="flex pt-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary h-4 w-4 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                        onClick={() => setOpenItems((prev) => !prev)}
                      >
                        <ChevronDown
                          className={`h-4 w-4 font-bold ${openItems ? 'rotate-180' : ''}`}
                        />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="w-full rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Total Property Value
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    ₹ {formatCurrency(property?.value)}
                  </h2>
                </div>
              </div>

              {/* Map + Property Info */}
              <div className="flex justify-between gap-3">
                <PlanAccessWrapper
                  featureId="MAP_VIEW_PROPERTY_LEVEL"
                  className="w-full"
                >
                  <div className="w-full rounded-md bg-[#F2F2F2] p-3">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Mini Map View
                    </h3>
                    <div className="h-40">
                      <MiniMap
                        coordinates={getCoordinatesForMap()}
                        propertyName={property?.name}
                        onClick={handleMiniMapClick}
                      />
                    </div>
                  </div>
                </PlanAccessWrapper>

                <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                  {['name', 'type', 'owner'].map((field) => (
                    <div key={field}>
                      <h3 className="mb-1 text-sm font-medium text-gray-500">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </h3>
                      <h2 className="truncate text-lg font-semibold">
                        {(property as any)?.[field] || '-'}
                      </h2>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Fields */}
              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                {[
                  'address',
                  'location',
                  'state',
                  'city',
                  'country',
                  'zipcode',
                ].map((field) => (
                  <div key={field}>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </h3>
                    <h2 className="text-lg font-semibold">
                      {(property as any)?.[field] || '-'}
                    </h2>
                  </div>
                ))}
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Co-ordinates
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    {property?.latitude === '0.00000000'
                      ? '-'
                      : property?.latitude}
                    {property?.latitude !== '0.00000000' &&
                    property?.longitude !== '0.00000000'
                      ? ','
                      : ''}
                    {property?.longitude === '0.00000000'
                      ? '-'
                      : property?.longitude}
                  </h2>
                </div>
              </div>

              {/* Extent & Value per Unit */}
              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Extent
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    {property?.extent}
                  </h2>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Value per {getUnitFromExtent()}
                  </h3>
                  <div className="flex justify-between">
                    <h2 className="truncate text-lg font-semibold">
                      ₹ {formatCurrency(property?.valuePerSQ)}
                    </h2>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      /{getUnitFromExtent()}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <h3 className="mb-1 text-sm font-medium text-gray-500">
                        {field.label}
                      </h3>
                      <h2 className="truncate text-lg font-semibold">
                        {field.value}
                      </h2>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents */}
              {uploadedDocuments && uploadedDocuments.length > 0 && (
                <div className="bg-[#F2F2F state management2] flex max-h-1/2 w-full flex-col space-y-5 overflow-y-auto rounded-md px-3 py-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Documents Uploaded
                  </h3>
                  <div className="flex flex-col space-y-3">
                    {uploadedDocuments.map((doc) => (
                      <div
                        key={doc.doc_id}
                        className="flex w-full justify-between rounded-md bg-white p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon type={doc.fileType as string} />
                          <h2 className="truncate text-sm font-extralight">
                            {doc.name}
                          </h2>
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-gray-400">
                          {doc.size} KB
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <PlanAccessWrapper
                featureId="ASSET_COMMENTING"
                className="w-full"
              >
                <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Comments
                  </h3>

                  <div className="space-y-3">
                    {loadingComments ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        <span className="ml-2 text-sm text-gray-500">
                          Loading comments...
                        </span>
                      </div>
                    ) : comments.length > 0 ? (
                      [...comments]
                        .reverse()
                        .map((comment) => renderComment(comment))
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        <p className="text-sm">No comments yet</p>
                        <p className="mt-1 text-xs">
                          Be the first to add a comment!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="relative space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) =>
                        handleCommentChange(e.target.value, 'main')
                      }
                      className="w-full resize-none rounded-md border p-3"
                      rows={3}
                      placeholder="Add a comment... You can use @mentions"
                    />
                    {showMentions['main'] &&
                      filteredUsers['main']?.length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                          {filteredUsers['main'].map((user) => (
                            <div
                              key={user.id}
                              onClick={() => selectMention(user, 'main')}
                              className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-secondary font-medium">
                                  @{extractUsername(user.email)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({user.email})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="bg-primary hover:bg-secondary"
                      >
                        {isSubmittingComment ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Posting...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Post Comment
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </PlanAccessWrapper>

              {/* Shared Users */}
              {sharedUsers.length > 0 && (
                <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Shared with
                  </h3>
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {sharedUsers.map((user) => (
                      <div key={user.id} className="flex">
                        {user.email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <Button
                  className="bg-primary hover:bg-secondary h-11 w-[200px] cursor-pointer px-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onEditClick && property) onEditClick(property)
                  }}
                >
                  <Pencil /> Edit Property
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FullMapModal
        isOpen={isMapModalOpen}
        onClose={handleMapModalClose}
        coordinates={getCoordinatesForMap()}
        propertyName={property?.name}
        propertyAddress={property?.address}
        documents={property?.documents}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                commentToDelete && handleDeleteComment(commentToDelete)
              }
              className="bg-primary"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PropertiesDetailsModel
