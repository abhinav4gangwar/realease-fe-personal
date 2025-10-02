'use client'

import { Button } from '@/components/ui/button'
import { ReportBlock } from '@/types/report-types'
import { FileDown, X } from 'lucide-react'
import ReportCanvas from './report-canvas'
import {
  exportReportAsDOCX,
  exportReportAsPDF,
} from './report_utils/report-export'

export default function ReportPreviewModal({
  isOpen,
  onClose,
  blocks,
  containerId,
  showExport = false,
}: {
  isOpen: boolean
  onClose: () => void
  blocks: ReportBlock[]
  containerId?: string
  showExport?: boolean
}) {
  if (!isOpen) return null

  const handleExportPDF = async () => {
    if (containerId) {
      await exportReportAsPDF(containerId)
    }
  }
  const handleExportDOCX = async () => {
    if (containerId) {
      await exportReportAsDOCX(containerId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative h-full w-screen overflow-hidden rounded-lg border border-gray-500 bg-white shadow-xl">
        <div className="flex items-center justify-between shadow-md bg-[#F2F2F2] p-4">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <div className="flex items-center gap-2">
            {showExport && (
              <>
                <Button
                  variant="outline"
                  className="h-9 bg-transparent"
                  onClick={handleExportPDF}
                  aria-label="Export PDF"
                >
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button
                  variant="outline"
                  className="h-9 bg-transparent"
                  onClick={handleExportDOCX}
                  aria-label="Export DOCX"
                >
                  <FileDown className="mr-2 h-4 w-4" /> DOCX
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-7 w-7 rounded-full bg-[#CDCDCE] text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-full overflow-y-auto">
          <ReportCanvas
            blocks={blocks}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            onRemove={() => {}}
            onChangeText={() => {}}
            onChangeChartType={() => {}}
            containerId={containerId}
          />
        </div>
      </div>
    </div>
  )
}
