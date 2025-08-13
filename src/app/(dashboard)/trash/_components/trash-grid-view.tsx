import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Document } from '@/types/document.types'
import { Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import { FileIcon } from './file-icon'

interface DocumentGridViewProps {
  documents: Document[]
  onFolderClick?: (document: Document) => void
  selectedDocumentId?: string
  selectedDocuments?: string[]
  onDocumentSelect?: (documentId: string) => void
  loadingFolders?: Set<string>
  onSelectAll?: () => void
  onRestoreClick?: (document: Document) => void
  onDeleteClick?: (document: Document) => void
}
const TrashGridView = ({
  documents,
  onFolderClick,
  selectedDocumentId,
  selectedDocuments,
  onDocumentSelect,
  onRestoreClick,
  onDeleteClick,
  loadingFolders = new Set(),
}: DocumentGridViewProps) => {
  const handleCardClick = (document: Document) => {
    if (document.isFolder && onFolderClick) {
      onFolderClick(document)
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
                <input
                  type="checkbox"
                  checked={selectedDocuments?.includes(document.id) || false}
                  onChange={() => onDocumentSelect?.(document.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 flex-shrink-0 cursor-pointer accent-[#f16969]"
                />
                <div className="flex items-center gap-2">
                  <FileIcon type={document.icon} className="h-7 w-6" />
                  {loadingFolders.has(document.id) && document.isFolder && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <h3 className="text-md max-w-[160px] truncate">
                  {document.name}
                </h3>
                <div className="ml-2 flex items-center gap-1 text-[#9B9B9D]">
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
            <div className="space-y-1 text-sm text-[#9B9B9D]">
              <p>{document.dateAdded}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default TrashGridView
