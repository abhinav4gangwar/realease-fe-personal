import { Button } from '@/components/ui/button'

interface RestoreDocumentModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DocumentRestoreModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: RestoreDocumentModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Content */}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold">Restore Document</h2>
          <p className="mb-6 text-gray-600">
            Are you sure you want to Restore?
          </p>

          <div className="flex gap-3">
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

export const BulkRestoreModal = ({
  isOpen,
  onConfirm,
  onCancel,
  selectedCount,
}: BulkRestoreModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-500 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold">Restore Documents</h2>
          <p className="mb-6 text-gray-600">
            Are you sure you want to restore {selectedCount} selected document
            {selectedCount > 1 ? 's' : ''}?
          </p>
          <div className="flex gap-3">
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
