import { Button } from '@/components/ui/button'
import { Properties } from '@/types/property.types'
import { X } from 'lucide-react'

interface PropertiesFilterModelProps {
  properties: Properties []
  isOpen: boolean
  onClose: () => void
}
const PropertiesFilterModel = ({
  isOpen,
  onClose,
}: PropertiesFilterModelProps) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`flex max-h-[80vh] w-full max-w-4xl flex-col space-y-4 rounded-lg border border-gray-400 bg-white shadow-lg`}
      >
        {/* header */}
        <div className="flex items-center justify-between rounded-t-lg bg-[#F2F2F2] px-4 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-secondary text-lg font-semibold">Filter</h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary h-5 w-5 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4 font-bold" />
          </Button>
        </div>

        {/* content */}
        <div className="max-h-96 overflow-y-auto p-4"></div>

        {/* footer */}
        <div className="flex items-center justify-end rounded-b-lg bg-[#F2F2F2] px-4 py-3">
          <div className="flex gap-4">
            <Button className="hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 border border-gray-400 bg-transparent px-6 font-semibold text-black hover:text-white">
              Clear All
            </Button>
            <Button className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6">
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesFilterModel
