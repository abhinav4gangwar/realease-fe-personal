import { Button } from '@/components/ui/button'
import { dummyReports } from '@/lib/analytics.dummy'
import { EllipsisVertical, FileText } from 'lucide-react'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'

const ReportsMobileTab = () => {
  return (
    <div className="">
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold">Reports</div>
        </div>

        <div className="flex items-center gap-4">
          <AnalyticsSTateToggle />
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-white p-6">
        <div className="space-y-6">
          {dummyReports.map((report) => (
            <div key={report.id} className="flex justify-between">
              <div className='flex items-center gap-2'>
                <FileText className='size-7' />
                <div className="flex flex-col">
                  
                  <span className="w-[220px] truncate text-sm font-medium">
                    {report.data.name}
                  </span>

                  <span className="truncate pt-1 text-xs text-[#9B9B9D]">Aug 16,2025  01:15 PM</span>
                </div>
              </div>

              <div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-7 w-7 cursor-pointer"
            >
              <EllipsisVertical className="hover:text-primary h-6 w-6 font-semibold text-[#9B9B9D]" />
            </Button>
          </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsMobileTab
