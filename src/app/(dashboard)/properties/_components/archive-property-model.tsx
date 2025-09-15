import { Button } from "@/components/ui/button"


interface ArchivePropertyModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ArchivePropertyModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: ArchivePropertyModalProps) => {
    if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
     <div className="w-full max-w-sm rounded-lg border bg-white shadow-lg border-gray-500">
        {/* Content */}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold">Archive Property</h2>
          <p className="mb-6 text-gray-600">Are you sure you want to archive this Property?</p>

           <div className="flex gap-3">
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

export default ArchivePropertyModal
