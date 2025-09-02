import { Button } from '@/components/ui/button'
import { Document } from '@/types/document.types'
import { Ellipsis, Loader2 } from 'lucide-react'
import { FileIcon } from '../_components/file-icon'

interface MobileDocumentListViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
  onDocumentPreview?: (document: Document) => void
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  isShareMode?: boolean
  onDocumentSelect?: (documentId: string) => void
  loadingFolders?: Set<string>
}

const MobileDocumentListView = ({
  documents,
  onDocumentInfo,
  onDocumentPreview,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  loadingFolders = new Set(),
}: MobileDocumentListViewProps) => {
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

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          onClick={() => handleRowClick(document)}
          className={`flex justify-between ${
            selectedDocumentId === document.id
              ? 'border-blue-200 bg-blue-50'
              : ''
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <FileIcon type={document.icon} />
              {loadingFolders.has(document.id) && document.isFolder && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className="w-[220px] truncate text-sm font-medium">
                {document.name}
              </span>
            </div>
            <div className="pt-2 text-left text-sm text-[#9B9B9D]">
              Date added: {document.dateAdded}
            </div>
          </div>

          <div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-7 w-7 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onDocumentInfo(document)
              }}
            >
              <Ellipsis className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MobileDocumentListView
