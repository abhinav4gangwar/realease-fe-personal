'use client'

import { Button } from '@/components/ui/button'
import type { Document } from '@/types/document.types'
import { X } from 'lucide-react'
import { useState } from 'react'
import { FileIcon } from './file-icon'

interface MoveDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  availableFolders: Document[]
  onMove: (documentId: string, newParentId: string | null) => Promise<void>
  onCreateFolder?: () => void
}

export function MoveDocumentModal({
  isOpen,
  onClose,
  document,
  availableFolders,
  onMove,
  onCreateFolder,
}: MoveDocumentModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  if (!isOpen || !document) return null

  const handleMove = async () => {
    if (!document) return

    setIsMoving(true)
    try {
      await onMove(document.id, selectedFolderId)
      onClose()
      setSelectedFolderId(null)
    } catch (error) {
      console.error('Error moving document:', error)
    } finally {
      setIsMoving(false)
    }
  }

  const handleRowClick = (folderId: string) => {
    setSelectedFolderId(folderId === selectedFolderId ? null : folderId)
  }

  const handleCreateFolder = () => {
    onClose()

    setSelectedFolderId(null)

    if (onCreateFolder) {
      onCreateFolder()
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
      <div className="flex max-h-[80vh] w-full max-w-5xl flex-col rounded-lg border border-gray-400 bg-white px-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <h2 className="text-secondary text-lg font-semibold">Move Docs</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto rounded-md border border-gray-400 p-6">
          <div className="space-y-1">
            {/* Header Row */}
            <div className="text-md text-secondary grid grid-cols-12 gap-4 px-4 py-2 font-semibold">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Linked Property</div>
              <div className="col-span-3">Date Added</div>
              <div className="col-span-2">Tags</div>
            </div>

            <div
              className={`grid cursor-pointer grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
                selectedFolderId === null
                  ? 'border border-blue-200 bg-blue-50'
                  : ''
              }`}
              onClick={() => handleRowClick('root')}
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileIcon type="folder" />
                </div>
                <span className="truncate text-sm font-medium">
                  Move to Default
                </span>
              </div>
              <div className="col-span-3 truncate text-sm text-[#9B9B9D]">
                -
              </div>
              <div className="col-span-3 text-sm text-[#9B9B9D]">-</div>
              <div className="col-span-2 truncate text-sm text-[#9B9B9D]">
                -
              </div>
            </div>

            {/* Folder Rows */}
            {availableFolders
              .filter((folder) => folder.isFolder && folder.id !== document.id)
              .map((folder) => (
                <div
                  key={folder.id}
                  className={`grid cursor-pointer grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
                    selectedFolderId === folder.id
                      ? 'border border-blue-200 bg-blue-50'
                      : ''
                  }`}
                  onClick={() => handleRowClick(folder.id)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FileIcon type={folder.icon} />
                    </div>
                    <span className="truncate text-sm font-medium">
                      {folder.name}
                    </span>
                  </div>
                  <div className="col-span-3 truncate text-sm text-[#9B9B9D]">
                    {folder.linkedProperty}
                  </div>
                  <div className="col-span-3 text-sm text-[#9B9B9D]">
                    {folder.dateAdded}
                  </div>
                  <div className="col-span-2 truncate text-sm text-[#9B9B9D]">
                    {folder.tags}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-6">
          <Button
            variant="outline"
            className="hover:bg-secondary h-11 cursor-pointer bg-transparent px-6 hover:text-white"
            onClick={handleCreateFolder}
          >
            Create Folder
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-secondary h-11 cursor-pointer bg-transparent px-6 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={isMoving}
              className="bg-primary hover:bg-secondary h-11 cursor-pointer px-6"
            >
              {isMoving ? 'Moving...' : 'Move Here'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
