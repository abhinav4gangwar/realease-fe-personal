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
import { User } from '@/types'
import type { Document } from '@/types/document.types'
import { apiClient } from '@/utils/api'
import { Check, MoreVertical, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from './file-icon'
import { TagInput } from './tags-input'

import { Properties } from '@/types/property.types'
import { propertiesApi } from '../../properties/_property_utils/property.services'
import { PropertyInput } from './properties-input'

// API function to get users (same as in PDFPreviewModal)
export const getUsers = async (documentId: number) => {
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

export interface DocumentDetailModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  openInEditMode?: boolean
  onSave?: (documentId: string, newName: string) => Promise<void>
  onEditFile?: (
    documentId: string,
    data: { name: string; propertyId: string; tags: string[] }
  ) => Promise<void>
  onDeleteClick?: (document: Document) => void
  onShareClick?: (document: Document) => void
  onMoveClick?: (document: Document) => void
  onDownloadClick?: (document: Document) => void
}

export function DocumentDetailModal({
  document,
  isOpen,
  onClose,
  openInEditMode = false,
  onSave,
  onEditFile,
  onDeleteClick,
  onShareClick,
  onMoveClick,
  onDownloadClick,
}: DocumentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editedProperty, setEditedProperty] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Add states for shared users
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)

  // Add state for properties
  const [properties, setProperties] = useState<Properties[]>([])

  // Load properties
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

    if (isOpen) {
      loadProperties()
    }
  }, [isOpen])

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
  }, [isOpen, openInEditMode, document, properties])

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
    <div className="fixed top-0 right-0 z-30 flex h-full w-[380px] flex-col border-l border-none bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-24">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileIcon type={document.icon} className="h-6 w-5 flex-shrink-0" />
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
            <h2 className="truncate pl-1 text-lg font-semibold">
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
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onMoveClick) {
                        onMoveClick(document)
                      }
                    }}
                    className="cursor-pointer font-semibold hover:bg-[#A2CFE333]"
                  >
                    Move
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
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onShareClick) {
                        onShareClick(document)
                      }
                    }}
                    className="cursor-pointer font-semibold hover:bg-[#A2CFE333]"
                  >
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onDeleteClick) {
                        onDeleteClick(document)
                      }
                    }}
                    className="cursor-pointer font-semibold hover:bg-[#A2CFE333]"
                  >
                    Delete
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
        <div className="m-4 flex h-64 items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <FileIcon type={document.icon} className="mx-auto mb-2 h-20 w-16" />
            <p className="text-sm text-gray-500">Document Preview</p>
          </div>
        </div>

        {/* Document Details */}
        <div className="space-y-4 p-4">
          {!document.isFolder && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">
                Linked Property
              </h3>
              {isEditing ? (
                <PropertyInput
                  value={editedProperty}
                  onChange={setEditedProperty}
                  placeholder="Select property..."
                />
              ) : (
                <p className="text-sm">
                  {document.linkedProperty || 'No Property'}
                </p>
              )}
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Date Added
            </h3>
            <p className="text-sm">{document.dateAdded}</p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Date Modified
            </h3>
            <p className="text-sm">{document.dateModified}</p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Last Opened
            </h3>
            <p className="text-sm">{document.lastOpened}</p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              File Type
            </h3>
            {document.isFolder ? (
              <p className="text-sm capitalize">{document.icon}</p>
            ) : (
              <FileTypeDisplay
                mimeType={document.fileType}
                fileName={document.name}
                className="text-sm"
                fallback="Unknown"
              />
            )}
          </div>

          {!document.isFolder && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">Tags</h3>
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
              <h3 className="mb-1 text-sm font-medium text-gray-500">Size</h3>
              <p className="text-sm">{formatFileSize(document.size)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
