'use client'

import { Button } from '@/components/ui/button'

interface CancelShareModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function CancelShareModal({
  isOpen,
  onConfirm,
  onCancel,
}: CancelShareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border bg-white shadow-lg">
        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">Cancel Share</h2>
          <p className="mb-6 text-gray-600">Are you sure you want to Cancel?</p>

          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={onConfirm}
              className="bg-primary px-6 hover:bg-red-600"
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-transparent px-6"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
