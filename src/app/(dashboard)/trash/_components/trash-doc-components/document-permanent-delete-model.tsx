import { Button } from '@/components/ui/button'

interface RestoreDocumentModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DocumentPermanentDeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: RestoreDocumentModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Content */}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-center">Permenantly Delete Document</h2>
          <p className="mb-6 text-gray-600 text-center">
            Are you sure you want to Delete Permenently?
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onConfirm}
              className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BulkRestoreModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  selectedCount: number
}

export const BulkDocumentPermanentDeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
  selectedCount,
}: BulkRestoreModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-500 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-center">Permanently Delete Documents</h2>
          <p className="mb-6 text-gray-600 text-center">
            Are you sure you want to delete {selectedCount} selected documents permenently
            {selectedCount > 1 ? 's' : ''}?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onConfirm}
              className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
