"use client"

import { Button } from "@/components/ui/button"
import type { Document } from "@/types/document.types"
import { Download, Edit, Info, Move, Share } from "lucide-react"
import { useState } from "react"
import { FileIcon } from "./file-icon"

interface DocumentListViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  isShareMode?: boolean
  selectedDocuments?: string[]
  onDocumentSelect?: (documentId: string) => void
  onEditClick?: (document: Document) => void
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
        <div className="col-span-3">Date Added</div>
        <div className="col-span-2">Tags</div>
      </div>

      {/* Document Rows */}
      {documents.map((document) => (
        <div
          key={document.id}
          className={`gapp-4 grid grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
            selectedDocumentId === document.id ? "border-blue-200 bg-blue-50" : ""
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
                className="w-4 h-4"
              />
            )}
            <FileIcon type={document.icon} />
            <span className="truncate text-sm font-medium">{document.name}</span>
          </div>
          <div className="col-span-3 truncate text-sm text-[#9B9B9D]">{document.linkedProperty}</div>
          <div className="col-span-3 text-sm text-[#9B9B9D]">{document.dateAdded}</div>
          <div className="col-span-1 truncate text-sm text-[#9B9B9D]">
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
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Move className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Share className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="h-3 w-3" />
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
