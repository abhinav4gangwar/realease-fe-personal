'use client'
import { Button } from '@/components/ui/button'
import { FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'
import ReportCreationModel from '../_components/reports-components/Report-creation-model'


const ReportsTab = () => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false)
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

      <div></div>

      <ReportCreationModel
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
      />
    </div>
  )
}

export default ReportsTab
