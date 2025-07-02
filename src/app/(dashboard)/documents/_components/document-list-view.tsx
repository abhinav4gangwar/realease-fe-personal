'use client'

import { Button } from '@/components/ui/button'
import { Document } from '@/types/document.types'
import { Info } from 'lucide-react'
import { FileIcon } from './file-icon'

interface DocumentListViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
}

export function DocumentListView({
  documents,
  onDocumentInfo,
}: DocumentListViewProps) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-md font-semibold text-secondary">
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Linked Property</div>
        <div className="col-span-3">Date Added</div>
        <div className="col-span-2">Tags</div>
      </div>

      {/* Document Rows */}
      {documents.map((document) => (
        <div
          key={document.id}
          className="grid grid-cols-12 items-center gapp-4 px-4 py-3 hover:bg-[#A2CFE333] hover:rounded-md"
        >
          <div className="col-span-4 flex items-center gap-3">
            <FileIcon type={document.icon} />
            <span className="truncate text-sm font-medium">
              {document.name}
            </span>
          </div>
          <div className="col-span-3 truncate text-sm text-[#9B9B9D]">
            {document.linkedProperty}
          </div>
          <div className="col-span-3 text-sm text-[#9B9B9D]">
            {document.dateAdded}
          </div>
          <div className="col-span-1 truncate text-sm text-[#9B9B9D]">
            {document.tags}
          </div>
          <div className="col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-primary cursor-pointer"
              onClick={() => onDocumentInfo(document)}
            >
              <Info className="h-6 w-6  font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
