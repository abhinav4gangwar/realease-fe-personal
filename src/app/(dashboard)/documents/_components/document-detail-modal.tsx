'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Document } from '@/types/document.types'
import { apiClient } from '@/utils/api'
import {
  Check,
  Download,
  Edit,
  MoreVertical,
  Move,
  Share,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from './file-icon'

interface DocumentDetailModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  openInEditMode?: boolean
}

export function DocumentDetailModal({
  document,
  isOpen,
  onClose,
  openInEditMode = false,
}: DocumentDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedLinkedProperty, setEditedLinkedProperty] = useState('')

  useEffect(() => {
    if (isOpen && openInEditMode && document) {
      setEditedName(document.name)
      setEditedLinkedProperty(document.linkedProperty)
      setIsEditing(true)
    } else if (isOpen && document) {
      setEditedName(document.name)
      setEditedLinkedProperty(document.linkedProperty)
      setIsEditing(false)
    }
  }, [isOpen, openInEditMode, document])

  if (!document || !isOpen) return null

  const handleEdit = () => {
    setEditedName(document.name)
    setEditedLinkedProperty(document.linkedProperty)
    setIsEditing(true)
  }

  //   {
  //   "itemId": 23,
  //   "newName": "rend folder"
  // }
  // console.log('Saving changes:', {
  //       id: Number.parseInt(document.id),
  //       name: editedName,
  //     })
  //     setIsEditing(false)

  const handleSave = async () => {
    const payload = {
      itemId: Number.parseInt(document.id),
      newName: editedName,
    }
    try {
      setIsLoading(true)
      const response = await apiClient.put(
        '/dashboard/documents/rename',
        payload
      )
      if (response.data.message) {
        toast.success(response.data.message)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'File Rename failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedName(document.name)
    setEditedLinkedProperty(document.linkedProperty)
  }

  return (
    <div className="fixed top-0 right-0 flex h-full w-[400px] flex-col border-l border-none bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-24">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileIcon type={document.icon} className="h-6 w-5 flex-shrink-0" />
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-auto border-gray-400 p-2 text-lg font-semibold focus-visible:ring-0"
              autoFocus
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
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Move className="mr-2 h-4 w-4" />
                    Move Doc
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
            {isEditing ? (
              <Input
                value={editedLinkedProperty}
                onChange={(e) => setEditedLinkedProperty(e.target.value)}
                className="text-sm"
              />
            ) : (
              <p className="text-sm">{document.linkedProperty}</p>
            )}
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
