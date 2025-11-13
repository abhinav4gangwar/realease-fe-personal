'use client'

import { Button } from '@/components/ui/button'

import { FilePlus2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'
import ReportCreationModel from '../_components/reports-components/Report-creation-model'
import ReportEditModal, {
  toBlocks,
} from '../_components/reports-components/report-edit-model'
import ReportListView from '../_components/reports-components/report-list-view'
import ReportPreviewModal from '../_components/reports-components/report-preview-model'
import { deleteReport, fetchReports } from '../_components/reports-components/report_utils/report.services'

const ReportsTab = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddReportOpen, setIsAddReportOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [isEditReportModelOpen, setIsEditPropertyModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Fetch reports on component mount
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await fetchReports()
      
      if (response.reports) {
        setReports(response.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (report) => {
    setSelectedReport(report)
    setIsEditPropertyModalOpen(true)
  }

  const handleDownloadClick = (report) => {
    setSelectedReport(report)
    setIsPreviewOpen(true)
  }

  const handleDeleteClick = async (reportId: number) => {
    try {
      await deleteReport(reportId)
      toast.success('Report deleted successfully')
      
      // Refresh reports list
      await loadReports()
    } catch (error: any) {
      console.error('Failed to delete report:', error)
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to delete report'
      toast.error(errorMessage)
    }
  }

  const handleReportCreated = () => {
    setIsAddReportOpen(false)
    loadReports() // Refresh list after creation
  }

  const handleReportUpdated = () => {
    setIsEditPropertyModalOpen(false)
    setSelectedReport(null)
    loadReports() // Refresh list after update
  }

  const handleCloseEdit = () => {
    setIsEditPropertyModalOpen(false)
    setSelectedReport(null)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedReport(null)
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-lg font-medium text-gray-600">Loading reports...</div>
                <div className="text-sm text-gray-500">Please wait</div>
              </div>
            </div>
          ) : (
            <ReportListView
              reports={reports}
              selectedReportId={selectedReport?.id}
              onEditClick={handleEditClick}
              onDownloadClick={handleDownloadClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </div>
      </div>

      {/* Report Creation Modal */}
      <ReportCreationModel
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
        onSuccess={handleReportCreated}
      />

      {/* Report Edit Modal */}
      <ReportEditModal
        initial={selectedReport}
        isOpen={isEditReportModelOpen}
        onClose={handleCloseEdit}
        onSuccess={handleReportUpdated}
      />
      
      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
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