"use client"

import { Button } from "@/components/ui/button"
import { Document } from "@/types/document.types"
import { X } from "lucide-react"
import { FileIcon } from "./file-icon"

interface SelectedDocsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDocuments: Document[]
  onRemoveDocument: (documentId: string) => void
  onSelectMore: () => void
  onShareViaEmail: () => void
  onCancel: () => void
}

export function SelectedDocsModal({
  isOpen,
  onClose,
  selectedDocuments,
  onRemoveDocument,
  onSelectMore,
  onShareViaEmail,
  onCancel,
}: SelectedDocsModalProps) {
  if (!isOpen) return null

  const folderCount = selectedDocuments.filter((doc) => doc.isFolder).length
  const fileCount = selectedDocuments.filter((doc) => !doc.isFolder).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border w-full max-w-2xl max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Selected Docs ({folderCount} Folder & {fileCount} Files)
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b bg-gray-50">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Linked Property</div>
            <div className="col-span-3">Date Added</div>
            <div className="col-span-2">Tags</div>
            <div className="col-span-1"></div>
          </div>

          {/* Document Rows */}
          {selectedDocuments.map((document) => (
            <div key={document.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 items-center">
              <div className="col-span-3 flex items-center gap-2">
                <FileIcon type={document.icon} />
                <span className="text-sm font-medium truncate">{document.name}</span>
              </div>
              <div className="col-span-3 text-sm text-gray-600 truncate">{document.linkedProperty}</div>
              <div className="col-span-3 text-sm text-gray-600">{document.dateAdded}</div>
              <div className="col-span-2 text-sm text-gray-600 truncate">{document.tags}</div>
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveDocument(document.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button variant="outline" onClick={onSelectMore}>
            Select More
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onShareViaEmail} className="bg-red-500 hover:bg-red-600">
              Share via Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
