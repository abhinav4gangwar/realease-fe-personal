'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Document } from '@/types/document.types'
import { Check, MoreVertical, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from './file-icon'

interface DocumentDetailModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  openInEditMode?: boolean
  onSave?: (documentId: string, newName: string) => Promise<void>
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
  onDeleteClick,
  onShareClick,
  onMoveClick,
  onDownloadClick,
}: DocumentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && openInEditMode && document) {
      setEditedName(document.name)
      setIsEditing(true)
    } else if (isOpen && document) {
      setEditedName(document.name)
      setIsEditing(false)
    }
  }, [isOpen, openInEditMode, document])

  if (!document || !isOpen) return null

  const handleEdit = () => {
    setEditedName(document.name)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!onSave || !document || editedName.trim() === document.name) {
      setIsEditing(false)
      return
    }

    if (editedName.trim() === '') {
      toast.error('Document name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      await onSave(document.id, editedName.trim())
      setIsEditing(false)
      toast.success(`Document renamed to "${editedName.trim()}"`)
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Failed to rename document. Please try again.')
      setEditedName(document.name)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(document.name)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="fixed top-0 right-0 flex h-full w-[380px] flex-col border-l border-none bg-white shadow-lg z-30">
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
                disabled={
                  isSaving ||
                  editedName.trim() === '' ||
                  editedName.trim() === document.name
                }
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
                      if ( onDownloadClick) {
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
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Linked Property
            </h3>
            <p className="text-sm">{document.linkedProperty}</p>
          </div>
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
            <p className="text-sm">{document.fileType}</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Tags</h3>
            <p className="text-sm">{document.tags}</p>
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
