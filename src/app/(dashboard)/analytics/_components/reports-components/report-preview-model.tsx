"use client"

import { Button } from "@/components/ui/button"
import { ReportBlock } from "@/types/report-types"
import { X } from "lucide-react"
import ReportCanvas from "./report-canvas"


export default function ReportPreviewModal({
  isOpen,
  onClose,
  blocks,
}: {
  isOpen: boolean
  onClose: () => void
  blocks: ReportBlock[]
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg border border-gray-500 bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#F2F2F2] p-4 shadow-md">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary h-7 w-7 rounded-full bg-[#CDCDCE] text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-full overflow-auto">
          <ReportCanvas
            blocks={blocks}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            onRemove={() => {}}
            onChangeText={() => {}}
            onChangeChartType={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
