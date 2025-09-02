'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileTypeDisplay } from '@/components/ui/file-type-display'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from '@/types'
import { apiClient } from '@/utils/api'
import { Check, MoreVertical, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DocumentDetailModalProps,
  getUsers,
} from '../_components/document-detail-modal'
import { FileIcon } from '../_components/file-icon'
import { TagInput } from '../_components/tags-input'

const properties = [{ id: '0', name: 'No Property' }]

const MobileDocumentDetailsModel = ({
  document,
  isOpen,
  onClose,
  openInEditMode = false,
  onSave,
  onEditFile,
  onDownloadClick,
}: DocumentDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editedProperty, setEditedProperty] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Add states for shared users
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen && openInEditMode && document) {
      const propertyId =
        properties.find((p) => p.name === document.linkedProperty)?.id || '0'
      setEditedName(document.name)
      setEditedProperty(propertyId || '0')
      setEditedTags(document.tags || '')
      setIsEditing(true)
    } else if (isOpen && document) {
      const propertyId =
        properties.find((p) => p.name === document.linkedProperty)?.id || '0'
      setEditedName(document.name)
      setEditedProperty(propertyId || '0')
      setEditedTags(document.tags || '')
      setIsEditing(false)
    }
  }, [isOpen, openInEditMode, document])

  // Load users when document changes
  useEffect(() => {
    if (isOpen && document && !document.isFolder) {
      loadUsers()
    }
  }, [isOpen, document, apiClient])

  const loadUsers = async () => {
    if (!document || !apiClient) return

    setIsLoadingUsers(true)
    try {
      const fetchedUsers = await getUsers(Number.parseInt(document.id))
      setUsers(fetchedUsers || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load shared users')
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Reset users when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUsers([])
    }
  }, [isOpen])

  if (!document || !isOpen) return null

  const handleEdit = () => {
    const propertyId =
      properties.find((p) => p.name === document.linkedProperty)?.id || '0'
    setEditedName(document.name)
    setEditedProperty(propertyId)
    setEditedTags(document.tags || '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!document || editedName.trim() === '') {
      toast.error('Document name cannot be empty')
      return
    }

    try {
      setIsSaving(true)

      if (document.isFolder) {
        if (onSave && editedName.trim() !== document.name) {
          await onSave(document.id, editedName.trim())
          toast.success(`Folder renamed to "${editedName.trim()}"`)
        }
      } else {
        if (onEditFile) {
          const tagsArray = editedTags
            ? editedTags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : []

          await onEditFile(document.id, {
            name: editedName.trim(),
            propertyId: editedProperty,
            tags: tagsArray,
          })
          toast.success(`Document updated successfully`)
        }
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Failed to save changes. Please try again.')
      setEditedName(document.name)
      setEditedProperty(document.linkedProperty || '0')
      setEditedTags(document.tags || '')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(document.name)
    setEditedProperty(document.linkedProperty || '0')
    setEditedTags(document.tags || '')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const hasChanges = () => {
    if (document.isFolder) {
      return editedName.trim() !== document.name
    } else {
      return (
        editedName.trim() !== document.name ||
        editedProperty !== (document.linkedProperty || '0') ||
        editedTags !== (document.tags || '')
      )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col rounded-t-xl bg-white shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-12 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FileIcon type={document.icon} className="h-8 w-7 flex-shrink-0" />
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-auto border-gray-400 p-2 text-lg font-semibold focus-visible:ring-0"
                autoFocus
                disabled={isSaving}
              />
            ) : (
              <h2 className="truncate text-lg font-semibold">
                {document.name}
              </h2>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSave}
                  disabled={isSaving || editedName.trim() === '' || !hasChanges()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-none">
                    <DropdownMenuItem
                      onClick={handleEdit}
                      className="cursor-pointer font-semibold hover:bg-[#A2CFE333]"
                    >
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer font-semibold hover:bg-[#A2CFE333]"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onDownloadClick) {
                          onDownloadClick(document)
                        }
                      }}
                    >
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Document Preview Area */}
          <div className="m-4 flex h-48 items-center justify-center rounded-lg bg-gray-100">
            <div className="text-center">
              <FileIcon type={document.icon} className="mx-auto mb-2 h-16 w-14" />
              <p className="text-sm text-gray-500">Document Preview</p>
            </div>
          </div>

          {/* Document Details */}
          <div className="space-y-4 p-4">
            {!document.isFolder && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Linked Property
                </h3>
                {isEditing ? (
                  <Select
                    value={editedProperty}
                    onValueChange={setEditedProperty}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full border-gray-400 focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm">{document.linkedProperty}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Date Added
                </h3>
                <p className="text-sm">{document.dateAdded}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Date Modified
                </h3>
                <p className="text-sm">{document.dateModified}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Last Opened
                </h3>
                <p className="text-sm">{document.lastOpened}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  File Type
                </h3>
                <FileTypeDisplay
                  mimeType={document.fileType}
                  fileName={document.name}
                  className="text-sm"
                  fallback="Unknown"
                />
              </div>
            </div>

            {!document.isFolder && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Tags</h3>
                {isEditing ? (
                  <TagInput
                    value={editedTags}
                    onChange={setEditedTags}
                    placeholder="Select tags..."
                  />
                ) : (
                  <p className="text-sm">{document.tags || 'No tags'}</p>
                )}
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">
                Shared With
              </h3>
              {isLoadingUsers ? (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="border-t-primary mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300"></div>
                  Loading shared users...
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="flex flex-col">
                        {user.email && (
                          <span className="text-xs">{user.email}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">Not shared with anyone</p>
              )}
            </div>

            {document.size && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-500">Size</h3>
                <p className="text-sm">{formatFileSize(document.size)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default MobileDocumentDetailsModel