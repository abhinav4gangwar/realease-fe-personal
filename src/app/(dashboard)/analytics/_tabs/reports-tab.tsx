'use client'

import { Button } from '@/components/ui/button'
import { dummyReports } from '@/lib/analytics.dummy'
import { FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'
import ReportCreationModel from '../_components/reports-components/Report-creation-model'
import ReportEditModal, {
  toBlocks,
} from '../_components/reports-components/report-edit-model'
import ReportListView from '../_components/reports-components/report-list-view'
import ReportPreviewModal from '../_components/reports-components/report-preview-model'

const ReportsTab = () => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isEditReportModelOpen, setIsEditPropertyModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleEditClick = (report) => {
    setSelectedReport(report)
    setIsEditPropertyModalOpen(true)
  }

  const handleDownlodClick = (report) => {
    setSelectedReport(report)
    setIsPreviewOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Reports
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnalyticsSTateToggle />

      
            <Button
              className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white"
              onClick={() => setIsAddReportOpen(true)}
            >
              <FilePlus2 className="size-6" />
            </Button>

        </div>
      </div>

      <div>
        <div className="mt-5 rounded-lg bg-white p-6">
          <ReportListView
            reports={dummyReports}
            selectedReportId={selectedReport?.id}
            onEditClick={handleEditClick}
            onDownloadClick={handleDownlodClick}
          />
        </div>
      </div>

      <ReportCreationModel
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
      />

      <ReportEditModal
        initial={selectedReport}
        isOpen={isEditReportModelOpen}
        onClose={() => setIsEditPropertyModalOpen(false)}
      />
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        blocks={
          selectedReport?.data?.blocks
            ? toBlocks(selectedReport.data.blocks)
            : []
        }
        containerId="preview-report-canvas"
        showExport={true}
      />
    </div>
  )
}

export default ReportsTab
