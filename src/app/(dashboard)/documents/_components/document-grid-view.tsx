'use client'
import { Button } from '@/components/ui/button'

import { Card, CardContent } from '@/components/ui/card'
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

interface DocumentGridViewProps {
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

export function DocumentGridView({
  documents,
  onDocumentInfo,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  selectedDocuments,
  onDocumentSelect,
  onDeleteClick,
  onMoveClick,
  onEditClick,
  onShareClick,
  loadingFolders = new Set(),
}: DocumentGridViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleCardClick = (document: Document) => {
    if (document.isFolder && onFolderClick && !isShareMode) {
      onFolderClick(document)
    } else if (!isShareMode) {
      onDocumentInfo(document)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card
          key={document.id}
          className={`rounded-sm border-none transition-shadow hover:bg-[#A2CFE333] hover:shadow-md ${
            selectedDocumentId === document.id
              ? 'bg-blue-50 ring-2 ring-blue-500'
              : ''
          }`}
          onMouseEnter={() => setHoveredCard(document.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick(document)}
        >
          <CardContent>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {isShareMode && (
                  <input
                    type="checkbox"
                    checked={selectedDocuments?.includes(document.id) || false}
                    onChange={() => onDocumentSelect?.(document.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 flex-shrink-0"
                  />
                )}
                <div className="flex items-center gap-2">
                  <FileIcon type={document.icon} className="h-7 w-6" />
                  {loadingFolders.has(document.id) && document.isFolder && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <h3 className="text-md truncate">{document.name}</h3>
                {hoveredCard === document.id && !isShareMode && (
                  <div className="ml-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
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
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onShareClick) {
                          onShareClick(document)
                        }
                      }}
                    >
                      <Share className="h-3 w-3" />
                    </Button> */}
                    <Button variant="ghost" size="icon" className="h-5 w-5">
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
                )}
              </div>
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
