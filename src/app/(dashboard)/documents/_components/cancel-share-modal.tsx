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
      <div className="w-full max-w-md rounded-lg border bg-white shadow-lg border-gray-500">
        {/* Content */}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-center">Cancel Share</h2>
          <p className="mb-6 text-gray-600 text-center">Are you sure you want to Cancel?</p>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onConfirm}
             className="bg-primary hover:bg-secondary cursor-pointer h-11 px-6 w-28"
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6 bg-transparent h-11 hover:bg-secondary hover:text-white cursor-pointer w-28"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
