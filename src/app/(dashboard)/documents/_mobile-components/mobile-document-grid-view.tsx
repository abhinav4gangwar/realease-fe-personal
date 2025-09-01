import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Document } from '@/types/document.types'
import { Ellipsis, Loader2 } from 'lucide-react'
import { FileIcon } from '../_components/file-icon'

interface MobileDocumentGridViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
  onDocumentPreview?: (document: Document) => void
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  isShareMode?: boolean
  onDocumentSelect?: (documentId: string) => void
  loadingFolders?: Set<string>
}
const MobileDocumentGridView = ({
  documents,
  onDocumentInfo,
  onDocumentPreview,
  onFolderClick,
  selectedDocumentId,
  isShareMode,
  loadingFolders = new Set(),
}: MobileDocumentGridViewProps) => {
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
          onClick={() => handleCardClick(document)}
        >
          <CardContent>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDocumentInfo(document)
                  }}
                >
                  <Ellipsis className="h-4 w-4" />
                </Button>
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

export default MobileDocumentGridView
