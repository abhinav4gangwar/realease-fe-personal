'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

interface DocumentGridViewProps {
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
}

export function DocumentGridView({
  documents,
  onDocumentInfo,
  onDocumentPreview,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  selectedDocuments,
  onDocumentSelect,
  onDeleteClick,
  onMoveClick,
  onEditClick,
  onShareClick,
  onDownloadClick,
  loadingFolders = new Set(),
}: DocumentGridViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleCardClick = (document: Document) => {
    if (isShareMode) return

    if (document.isFolder && onFolderClick) {
      onFolderClick(document)
    } else if (onDocumentPreview) {
      onDocumentPreview(document)
    } else {
      onDocumentInfo(document)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card
          key={document.id}
          className={`cursor-pointer rounded-sm border-none transition-shadow hover:bg-[#A2CFE333] hover:shadow-md ${
            selectedDocumentId === document.id ? 'bg-[#A2CFE333]' : ''
          }`}
          onMouseEnter={() => setHoveredCard(document.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick(document)}
        >
          <CardContent>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDocuments?.includes(document.id) || false}
                  onChange={() => onDocumentSelect?.(document.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 flex-shrink-0 cursor-pointer accent-[#f56161]"
                />
                <div className="flex items-center gap-2">
                  <FileIcon type={document.icon} className="h-7 w-6" />
                  {loadingFolders.has(document.id) && document.isFolder && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <h3 className="text-md max-w-[170px] truncate">
                  {document.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[#9B9B9D]">
                {hoveredCard === document.id && !isShareMode && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditClick?.(document)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveClick?.(document)
                      }}
                    >
                      <FolderInput className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownloadClick?.(document)
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onShareClick?.(document)
                      }}
                    >
                      <HiShare className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteClick?.(document)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}

                {!isShareMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDocumentInfo(document)
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm text-[#9B9B9D]">
              <p className="truncate">{document.linkedProperty}</p>
              <p>{document.dateAdded}</p>
              <div className="truncate">{document.tags}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
