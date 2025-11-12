import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Download, Pencil, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { HiShare } from 'react-icons/hi2'
import { toast } from 'sonner'
import { shareReport } from './report_utils/report.services'

export interface ReportListViewProps {
  reports: any[]
  selectedReportId?: string
  onEditClick?: (report: any) => void
  onDownloadClick?: (report: any) => void
  onDeleteClick?: (reportId: number) => void
}

const ReportListView = ({
  reports,
  selectedReportId,
  onEditClick,
  onDownloadClick,
  onDeleteClick,
}: ReportListViewProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedReportForShare, setSelectedReportForShare] = useState<any>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [shareExpiry, setShareExpiry] = useState<string>('null')
  const [sharing, setSharing] = useState(false)
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReportForDelete, setSelectedReportForDelete] = useState<any>(null)

  const handleShareClick = (report: any) => {
    setSelectedReportForShare(report)
    setShareDialogOpen(true)
    setShareEmail('')
    setShareExpiry('null')
  }

  const handleShareSubmit = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shareEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!selectedReportForShare) {
      toast.error('No report selected')
      return
    }

    try {
      setSharing(true)
      
      const expiryValue = shareExpiry === 'null' ? null : parseInt(shareExpiry)
      
      const response = await shareReport({
        email: shareEmail,
        reports: [{ id: selectedReportForShare.id }],
        expiry: expiryValue as any,
      })

      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        
        if (result.status === 'shared') {
          toast.success(`Report shared successfully with ${shareEmail}`)
        } else if (result.status === 'extended') {
          toast.success(`Report access extended for ${shareEmail}`)
        } else if (result.status === 'already_shared') {
          toast.info('Report already shared with same or later expiry')
        } else if (result.status === 'not_found_or_deleted') {
          toast.error('Report not found or has been deleted')
        } else if (result.status === 'access_denied') {
          toast.error('You do not have permission to share this report')
        } else {
          toast.error('Failed to share report')
        }
      } else {
        toast.success('Report shared successfully')
      }

      setShareDialogOpen(false)
      setSelectedReportForShare(null)
      setShareEmail('')
      setShareExpiry('null')
    } catch (error: any) {
      console.error('Failed to share report:', error)
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to share report'
      toast.error(errorMessage)
    } finally {
      setSharing(false)
    }
  }

  const handleDeleteClick = (report: any) => {
    setSelectedReportForDelete(report)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedReportForDelete) {
      onDeleteClick?.(selectedReportForDelete.id)
      setDeleteDialogOpen(false)
      setSelectedReportForDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return '--:--'
    }
  }

  return (
    <>
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
        {reports.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-gray-600">No reports found</p>
            <p className="mt-2 text-sm text-gray-500">Create your first report to get started</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className={`grid cursor-pointer grid-cols-16 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
                selectedReportId === report.id ? 'border-blue-200 bg-blue-50 rounded-md' : ''
              }`}
            >
              <div className="col-span-6 flex items-center gap-3">
                <span className="truncate text-sm font-semibold">
                  {report.data?.name || 'Untitled Report'}
                </span>
              </div>

              <div className="col-span-6 truncate text-left text-sm">
                {formatDate(report.createdAt)}{' '}
                <span className="pl-6 text-[#9B9B9D]">
                  {formatTime(report.createdAt)}
                </span>
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
                    title="Edit report"
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
                    title="Preview/Download report"
                  >
                    <Download className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShareClick(report)
                    }}
                    title="Share report"
                  >
                    <HiShare className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer"
                    title="Send report (coming soon)"
                    disabled
                  >
                    <Send className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-600 h-6 w-6 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(report)
                    }}
                    title="Delete report"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="w-3xl border-gray-400">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Share {selectedReportForShare?.data?.name} with others via email.
              They will receive an email with access to view the report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                disabled={sharing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiry">Access Expiration</Label>
              <Select value={shareExpiry} onValueChange={setShareExpiry} disabled={sharing}>
                <SelectTrigger id="expiry">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Never expires</SelectItem>
                  <SelectItem value="15">15 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
              disabled={sharing}
            >
              Cancel
            </Button>
            <Button onClick={handleShareSubmit} disabled={sharing}>
              {sharing ? 'Sharing...' : 'Share Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report {selectedReportForDelete?.data?.name || 'Untitled Report'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedReportForDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-primary"
            >
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ReportListView