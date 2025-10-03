'use client'
import { Button } from '@/components/ui/button'
import { Comment, Properties, SharedUser } from '@/types/property.types'
import { formatCoordinates } from '@/utils/coordinateUtils'
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
import { FileIcon } from '../../documents/_components/file-icon'
import FullMapModal from './map-model'
import MiniMap from './minimap'
import { CustomField } from './properties-edit-model'

import { apiClient } from '@/utils/api'
import { toast } from 'sonner'

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
  const [replyText, setReplyText] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [filteredUsers, setFilteredUsers] = useState<SharedUser[]>([])

  const uploadedDocuments = property?.documents

  const handleMiniMapClick = () => {
    setIsMapModalOpen(true)
  }

  const handleCommentChange = (value: string, isReply = false) => {
    if (isReply) {
      setReplyText(value)
    } else {
      setNewComment(value)
    }

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1)
      const spaceIndex = textAfterAt.indexOf(' ')
      const query =
        spaceIndex === -1 ? textAfterAt : textAfterAt.substring(0, spaceIndex)

      if (spaceIndex === -1) {
        // Only show mentions if we're still typing after @
        setMentionQuery(query)
        setShowMentions(true)
        setCursorPosition(lastAtIndex)

        // Filter users based on query
        const filtered = sharedUsers.filter((user) =>
          extractUsername(user.email)
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        setFilteredUsers(filtered)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const selectMention = (user: SharedUser, isReply = false) => {
    const username = extractUsername(user.email)
    const currentText = isReply ? replyText : newComment
    const beforeAt = currentText.substring(0, cursorPosition)
    const afterMention = currentText.substring(
      cursorPosition + 1 + mentionQuery.length
    )

    const newText = `${beforeAt}@${username} ${afterMention}`

    if (isReply) {
      setReplyText(newText)
    } else {
      setNewComment(newText)
    }

    setShowMentions(false)
    setMentionQuery('')
  }

  const handleMapModalClose = () => {
    setIsMapModalOpen(false)
  }

  // Helper function to get coordinates in the correct format for display
  const getCoordinatesForDisplay = () => {
    if (!property) return ''

    // If backend sends separate latitude/longitude, combine them
    if ((property as any).latitude && (property as any).longitude) {
      return formatCoordinates(
        (property as any).latitude,
        (property as any).longitude
      )
    }

    // Fallback to existing coordinates field
    return property.coordinates || ''
  }

  // Helper function to get coordinates for map components (they expect the old format)
  const getCoordinatesForMap = () => {
    if (!property) return ''

    // If backend sends separate latitude/longitude, convert to old format
    if ((property as any).latitude && (property as any).longitude) {
      const lat = parseFloat((property as any).latitude)
      const lng = parseFloat((property as any).longitude)

      if (!isNaN(lat) && !isNaN(lng)) {
        const latDir = lat >= 0 ? 'N' : 'S'
        const lngDir = lng >= 0 ? 'E' : 'W'
        return `${Math.abs(lat)} ${latDir}; ${Math.abs(lng)} ${lngDir}`
      }
    }

    // Fallback to existing coordinates field
    return property.coordinates || ''
  }

  //load users
  const loadUsers = async () => {
    if (!property?.id) return

    try {
      const response = await apiClient.get(
        `/dashboard/properties/getUsers/${property.id}`
      )
      setSharedUsers(response.data.users)
    } catch (error: any) {
      toast.error(error)
    }
  }

  // Load comments
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

  // Add new comment
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

  // Add reply to comment
  const handleAddReply = async (parentId: number) => {
    if (!replyText.trim() || !property?.id) return

    setIsSubmittingComment(true)
    try {
      const response = await apiClient.post(
        '/dashboard/properties/comments/create',
        {
          text: replyText,
          propertyId: property.id,
          parentId: parentId,
        }
      )

      setComments(response.data || [])
      setReplyText('')
      setReplyingToId(null)
      toast.success('Reply added successfully')
    } catch (error: any) {
      toast.error('Failed to add reply')
      console.error('Error adding reply:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Update comment
  const handleUpdateComment = async (commentId: number) => {
    if (!editingText.trim()) return

    try {
      await apiClient.put('/dashboard/properties/comments/update', {
        text: editingText,
        commentId: commentId,
      })

      // Reload comments after update
      await loadComments()
      setEditingCommentId(null)
      setEditingText('')
      toast.success('Comment updated successfully')
    } catch (error: any) {
      toast.error('Failed to update comment')
      console.error('Error updating comment:', error)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await apiClient.delete(
        `/dashboard/properties/comments/delete/${commentId}`
      )

      // Remove the comment from local state
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      toast.success('Comment deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete comment')
      console.error('Error deleting comment:', error)
    }
  }

  // Start editing comment
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingText(comment.text)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Render comment component
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`rounded-md border p-3 ${isReply ? 'ml-6 bg-gray-50' : 'bg-white'}`}
    >
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-2 text-sm text-gray-800">{comment.text}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Author: {comment.author}</span>
                <span>•</span>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-1">
              {!isReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingToId(comment.id)}
                  className="h-6 w-6 p-0"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}
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
                onClick={() => handleDeleteComment(comment.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Reply input */}
          {replyingToId === comment.id && (
            <div className="mt-3 space-y-2">
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => handleCommentChange(e.target.value, true)}
                  className="w-full resize-none rounded-md border p-2"
                  rows={2}
                  placeholder="Write a reply..."
                />

                {/* Reply mention dropdown */}
              
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddReply(comment.id)}
                  disabled={!replyText.trim() || isSubmittingComment}
                >
                  Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplyingToId(null)
                    setReplyText('')
                    setShowMentions(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {comment.children &&
            Array.isArray(comment.children) &&
            comment.children.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.children.map((reply) => renderComment(reply, true))}
              </div>
            )}
        </>
      )}
    </div>
  )

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

    // Load comments when modal opens
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
            {/* Header - unchanged */}
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
              <div className="flex justify-between gap-3">
                <div className="flex w-full justify-between rounded-md bg-[#F2F2F2] px-3 py-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Legal Status
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                     {property?.isDisputed ? (property?.legalStatus) : ("Undisputed")} 
                    </h2>
                    {property?.isDisputed && openItems && (
                      <div className="flex flex-col space-y-3 pt-3">
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Parties
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.legalParties}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Case Number
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.caseNumber}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Case Type
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.caseType}
                          </h2>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-gray-500">
                            Next Hearing
                          </h3>
                          <h2 className="truncate text-lg font-semibold">
                            {property?.nextHearing}
                          </h2>
                        </div>
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
                          className={`h-4 w-4 font-bold ${
                            openItems ? 'rotate-180' : ''
                          }`}
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
                    ₹ {property?.value}
                  </h2>
                </div>
              </div>

              <div className="flex justify-between gap-3">
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

                <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Property Name
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.name}
                    </h2>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Property Type
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.type}
                    </h2>
                  </div>

                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      Owner
                    </h3>
                    <h2 className="truncate text-lg font-semibold">
                      {property?.owner}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Address
                  </h3>
                  <h2 className="text-lg font-semibold">{property?.address}</h2>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Co-ordinates
                  </h3>
                  <h2 className="truncate text-lg font-semibold">
                    {getCoordinatesForDisplay()}
                  </h2>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-5 rounded-md bg-[#F2F2F2] px-3 py-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Extent
                  </h3>
                  <div className="flex justify-between">
                    <h2 className="truncate text-lg font-semibold">
                      {property?.extent}
                    </h2>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      square yards
                    </h3>
                  </div>
                </div>

                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-500">
                    Value per square yard
                  </h3>
                  <div className="flex justify-between">
                    <h2 className="truncate text-lg font-semibold">
                      ₹ {property?.valuePerSQ}
                    </h2>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">
                      /square yard
                    </h3>
                  </div>
                </div>
              </div>

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

              {uploadedDocuments && uploadedDocuments?.length > 0 && (
                <div className="flex max-h-1/2 w-full flex-col space-y-5 overflow-y-auto rounded-md bg-[#F2F2F2] px-3 py-2">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">
                    Documents Uploaded
                  </h3>

                  <div className="flex flex-col space-y-3">
                    {uploadedDocuments?.map((uploadedDocument) => (
                      <div
                        key={uploadedDocument.doc_id}
                        className="w-ful flex justify-between rounded-md bg-white p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon
                            type={uploadedDocument.fileType as string}
                          />
                          <h2 className="truncate text-sm font-extralight">
                            {uploadedDocument.name}
                          </h2>
                        </div>

                        <h3 className="mb-1 text-sm font-medium text-gray-400">
                          {uploadedDocument.size} KB
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="flex w-full flex-col space-y-4 rounded-md bg-[#F2F2F2] px-3 py-2">
                <h3 className="text-sm font-medium text-gray-500">Comments</h3>

                {/* Add Comment Input */}
                <div className="relative space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    className="w-full resize-none rounded-md border p-3"
                    rows={3}
                    placeholder="Add a comment... You can use @mentions"
                  />

                  {/* Mention dropdown */}
                  {showMentions && filteredUsers.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => selectMention(user)}
                          className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-secondary">
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

                {/* Comments List */}
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                      <span className="ml-2 text-sm text-gray-500">
                        Loading comments...
                      </span>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => renderComment(comment))
                  ) : (
                    <div className="py-6 text-center text-gray-500">
                      <p className="text-sm">No comments yet</p>
                      <p className="mt-1 text-xs">
                        Be the first to add a comment!
                      </p>
                    </div>
                  )}
                </div>
              </div>

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

            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="bg-primary hover:bg-secondary h-11 w-[200px] cursor-pointer px-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditClick && property) {
                        onEditClick(property)
                      }
                    }}
                  >
                    <Pencil /> Edit Property
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Map Modal */}
      <FullMapModal
        isOpen={isMapModalOpen}
        onClose={handleMapModalClose}
        coordinates={getCoordinatesForMap()}
        propertyName={property?.name}
        propertyAddress={property?.address}
        documents={property?.documents}
      />
    </>
  )
}

export default PropertiesDetailsModel
