import { Button } from '@/components/ui/button'
import { Download, Pencil, Send, Trash2 } from 'lucide-react'
import { HiShare } from 'react-icons/hi2'

export interface ReportListViewProps {
  reports: any
  selectedReportId?: string
  onEditClick?: (report) => void
  onDownloadClick? : (report) => void
}
const ReportListView = ({
  reports,
  selectedReportId,
  onEditClick,
  onDownloadClick
}: ReportListViewProps) => {
  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="text-md grid grid-cols-16 gap-4 px-4 py-2 font-semibold text-[#9B9B9D]">
        <div className="col-span-6 flex items-center gap-3">
          <div>Report Name</div>
        </div>
        <div className="col-span-6 text-left">Date & Time</div>
        <div className="col-span-4 text-left">Actions</div>
      </div>

      {/* Report list */}

      {reports.map((report) => (
        <div
          key={report.id}
          className={`grid cursor-pointer grid-cols-16 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
            selectedReportId === report.id ? 'border-blue-200 bg-blue-50' : ''
          }`}
        >
          <div className="col-span-6 flex items-center gap-3">
            <span className="truncate text-sm font-semibold">
              {report.data.name}
            </span>
          </div>

          <div className="col-span-6 truncate text-left text-sm">
            Aug 16,2025 <span className="pl-6 text-[#9B9B9D]">01:15 PM</span>
          </div>

          <div className="col-span-4 truncate text-left text-sm text-[#9B9B9D]">
            <div className="flex gap-1 pl-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditClick?.(report)
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownloadClick?.(report)
                }}
              >
                <Download className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
              >
                <HiShare className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
              >
                <Send className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReportListView
