'use client'
import { Button } from '@/components/ui/button'
import { Grid2x2Plus } from 'lucide-react'
import { useState } from 'react'
import AnalyticsBasicCard from '../_components/analytics-components/analytics-basic-card'
import { AnalyticsChartCard } from '../_components/analytics-components/analytics-chart-card'
import AnalyticsSidebar from '../_components/analytics-components/analytics-sidebar'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'

const AnalyticsTab = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Analytics
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnalyticsSTateToggle />

          <Button
            className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Grid2x2Plus className="size-6" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <AnalyticsBasicCard
            heading={'Total Number of Assets'}
            color={'secondary'}
            value={'1,250'}
            insight={
              'This shows the total number of assets currently available.'
            }
          />
          <AnalyticsBasicCard
            heading={'Total Asset Value'}
            color={'secondary'}
            value={'₹ 382.92 Cr'}
            insight={
              'This shows the total number of assets currently available.'
            }
          />
          <AnalyticsBasicCard
            heading={'Assets in Litigation'}
            color={'primary'}
            value={'12.6%'}
            insight={
              'This shows the total number of assets currently available.'
            }
          />
        </div>

        {/* charts */}
        <div className="grid grid-cols-3 gap-4">
          <AnalyticsChartCard defaultChart="bar" />
          <AnalyticsChartCard defaultChart="pie" />
          <AnalyticsChartCard defaultChart="donut" />
        </div>
      </div>

      <AnalyticsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}

export default AnalyticsTab
