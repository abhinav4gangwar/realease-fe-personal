'use client'
import { Button } from '@/components/ui/button'

import type { Document } from '@/types/document.types'
import {
  Download,
  Edit,
  Info,
  Loader2,
  Move,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import { FileIcon } from './file-icon'

interface DocumentListViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  isShareMode?: boolean
  selectedDocuments?: string[]
  onDocumentSelect?: (documentId: string) => void
  onEditClick?: (document: Document) => void
  onDeleteClick?: (document: Document) => void
  onMoveClick?: (document: Document) => void
  onShareClick?: (document: Document) => void
  loadingFolders?: Set<string>
}

export function DocumentListView({
  documents,
  onDocumentInfo,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  selectedDocuments,
  onDocumentSelect,
  onEditClick,
  onMoveClick,
  onDeleteClick,
  onShareClick,
  loadingFolders = new Set(),
}: DocumentListViewProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleRowClick = (document: Document) => {
    if (document.isFolder && onFolderClick && !isShareMode) {
      onFolderClick(document)
    } else if (!isShareMode) {
      onDocumentInfo(document)
    }
  }

  

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="text-md text-secondary grid grid-cols-12 gap-4 px-4 py-2 font-semibold">
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Linked Property</div>
        <div className="col-span-2">Date Added</div>
        <div className="col-span-2">Tags</div>
      </div>
      {/* Document Rows */}
      {documents.map((document) => (
        <div
          key={document.id}
          className={`grid grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
            selectedDocumentId === document.id
              ? 'border-blue-200 bg-blue-50'
              : ''
          }`}
          onMouseEnter={() => setHoveredRow(document.id)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => handleRowClick(document)}
        >
          <div className="col-span-4 flex items-center gap-3">
            {isShareMode && (
              <input
                type="checkbox"
                checked={selectedDocuments?.includes(document.id) || false}
                onChange={() => onDocumentSelect?.(document.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4"
              />
            )}
            <div className="flex items-center gap-2">
              <FileIcon type={document.icon} />
              {loadingFolders.has(document.id) && document.isFolder && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
            <span className="truncate text-sm font-medium">
              {document.name}
            </span>
          </div>
          <div className="col-span-3 truncate text-sm text-[#9B9B9D]">
            {document.linkedProperty}
          </div>
          <div className="col-span-2 text-sm text-[#9B9B9D]">
            {document.dateAdded}
          </div>
          <div className="col-span-2 truncate text-sm text-[#9B9B9D]">
            {hoveredRow === document.id && !isShareMode ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onEditClick) {
                      onEditClick(document)
                    }
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onMoveClick) {
                      onMoveClick(document)
                    }
                  }}
                >
                  <Move className="h-3 w-3" />
                </Button>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                   onClick={(e) => {
                    e.stopPropagation()
                    if (onShareClick) {
                      onShareClick(document)
                    }
                  }}
                >
                  <Share className="h-3 w-3" />
                </Button> */}
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onDeleteClick) {
                      onDeleteClick(document)
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              document.tags
            )}
          </div>
          <div className="col-span-1 flex justify-end">
            {!isShareMode && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-7 w-7 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onDocumentInfo(document)
                }}
              >
                <Info className="h-6 w-6 font-semibold text-[#9B9B9D]" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
