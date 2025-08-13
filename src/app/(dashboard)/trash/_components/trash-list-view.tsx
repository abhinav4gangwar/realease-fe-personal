import { Button } from '@/components/ui/button'
import { Document } from '@/types/document.types'
import { Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import { FileIcon } from './file-icon'

interface DocumentListViewProps {
  documents: Document[]
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  selectedDocuments?: string[]
  onDocumentSelect?: (documentId: string) => void
  loadingFolders?: Set<string>
  onSelectAll?: () => void
  selectAllState?: 'none' | 'some' | 'all'
  onRestoreClick?: (document: Document) => void
  onDeleteClick?: (document: Document) => void
}

const TrashListView = ({
  documents,
  onFolderClick,
  selectedDocumentId,
  selectedDocuments,
  onDocumentSelect,
  onRestoreClick,
  loadingFolders = new Set(),
  onSelectAll,
  onDeleteClick,
  selectAllState = 'none',
}: DocumentListViewProps) => {
  const handleRowClick = (document: Document) => {
    if (document.isFolder && onFolderClick) {
      onFolderClick(document)
    }
  }
  console.log(documents)
  return (
    <div className="space-y-1">
      <div className="text-md text-secondary grid grid-cols-13 gap-4 px-4 py-2 font-semibold">
        <div className="col-span-7 flex items-center gap-3">
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

        <div className="col-span-4 text-left">Date Deleted</div>
        <div className="col-span-2 text-left">Actions</div>
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
          onClick={() => handleRowClick(document)}
        >
          <div className="col-span-7 flex items-center gap-3">
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
          <div className="col-span-4 truncate pl-2 text-left text-sm text-[#9B9B9D]">
            {document.dateModified}
          </div>

          <div className="col-span-2 truncate text-left text-sm text-[#9B9B9D]">
            <div className="flex gap-1 pl-5">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onRestoreClick) {
                    onRestoreClick(document)
                  }
                }}
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>

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
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrashListView
