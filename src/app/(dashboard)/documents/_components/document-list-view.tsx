'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Button } from '@/components/ui/button'
import type { Document } from '@/types/document.types'
import {
  Download,
  FolderInput,
  Info,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { HiShare } from 'react-icons/hi2'
import { FileIcon } from './file-icon'

interface DocumentListViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
  onDocumentPreview?: (document: Document) => void
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  isShareMode?: boolean
  selectedDocuments?: string[]
  onDocumentSelect?: (documentId: string) => void
  onEditClick?: (document: Document) => void
  onDeleteClick?: (document: Document) => void
  onMoveClick?: (document: Document) => void
  onShareClick?: (document: Document) => void
  onDownloadClick?: (document: Document) => void
  loadingFolders?: Set<string>
  onSelectAll?: () => void
  selectAllState?: 'none' | 'some' | 'all'
}

export function DocumentListView({
  documents,
  onDocumentInfo,
  onDocumentPreview,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  selectedDocuments,
  onDocumentSelect,
  onEditClick,
  onMoveClick,
  onDeleteClick,
  onShareClick,
  onDownloadClick,
  loadingFolders = new Set(),
  onSelectAll,
  selectAllState = 'none',
}: DocumentListViewProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleRowClick = (document: Document) => {
    if (isShareMode) return
    if (document.isFolder && onFolderClick) {
      onFolderClick(document)
    } else if (onDocumentPreview) {
      onDocumentPreview(document)
    } else {
      onDocumentInfo(document)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-20">
        <div>
          <h1 className="text-secondary text-3xl">No Documents Added Yet</h1>
          <p className="text-primary py-4 text-center text-lg">
            Add a new document
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="text-md text-secondary grid grid-cols-13 gap-4 px-4 py-2 font-semibold">
        <div className="col-span-5 flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#f16969]"
            checked={selectAllState === 'all'}
            ref={(el) => {
              if (el) {
                el.indeterminate = selectAllState === 'some'
              }
            }}
            onChange={onSelectAll}
          />
          <div>Name</div>
        </div>
        <div className="col-span-3 text-center">Linked Property</div>
        <div className="col-span-2 text-center">Date Added</div>
        <div className="col-span-2 text-center">Tags</div>
      </div>
      {/* Document Rows */}
      {documents.map((document) => (
        <div
          key={document.id}
          className={`grid cursor-pointer grid-cols-13 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
            selectedDocumentId === document.id
              ? 'border-blue-200 bg-blue-50'
              : ''
          }`}
          onMouseEnter={() => setHoveredRow(document.id)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => handleRowClick(document)}
        >
          <div className="col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedDocuments?.includes(document.id) || false}
              onChange={() => onDocumentSelect?.(document.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 accent-[#f16969]"
            />
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
          <div className="col-span-3 truncate text-center text-sm text-[#9B9B9D]">
            {document.linkedProperty}
          </div>
          <div className="col-span-2 text-center text-sm text-[#9B9B9D]">
            {document.dateAdded}
          </div>
          <div className="col-span-2 truncate text-center text-sm text-[#9B9B9D]">
            {hoveredRow === document.id && !isShareMode ? (
              <div className="flex justify-center gap-1">
                <PlanAccessWrapper featureId="PERM_DOC_EDIT">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditClick) {
                        onEditClick(document)
                      }
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </PlanAccessWrapper>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onMoveClick) {
                      onMoveClick(document)
                    }
                  }}
                >
                  <FolderInput className="h-3 w-3" />
                </Button>
                <PlanAccessWrapper featureId="PERM_DOC_DOWNLOAD">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onDownloadClick) {
                        onDownloadClick(document)
                      }
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </PlanAccessWrapper>
                <PlanAccessWrapper featureId="DOCUMENT_SHARE_SECURE_EXPIRY">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onShareClick) {
                        onShareClick(document)
                      }
                    }}
                  >
                    <HiShare className="h-3 w-3" />
                  </Button>
                </PlanAccessWrapper>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer"
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
              <span className="pl-2">{document.tags}</span>
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
                <Info className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
