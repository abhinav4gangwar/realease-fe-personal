'use client'
import { Button } from '@/components/ui/button'
import { dummyAnalytics } from '@/lib/analytics.dummy'
import { Grid2x2Plus } from 'lucide-react'
import { useState } from 'react'
import AnalyticsBasicCard from '../_components/analytics-components/analytics-basic-card'
import { AnalyticsChartCard } from '../_components/analytics-components/analytics-chart-card'
import AnalyticsSidebar from '../_components/analytics-components/analytics-sidebar'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'

export const AnalyticsRenderer = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* Basic Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {dummyAnalytics.cards
          .filter((card) => card.type === "basic")
          .map((card) => (
            <AnalyticsBasicCard
              key={card.id}
              heading={card.title}
              color={card.color}
              value={card.value}
              insight={card.insight}
            />
          ))}
      </div>

      {/* Chart Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {dummyAnalytics.cards
          .filter((card) => card.type === "chart")
          .map((card) => (
            <AnalyticsChartCard
              key={card.id}
              defaultChart={card.chartType}
              data={card.data}
              title={card.title}
              insight={card.insight}
            />
          ))}
      </div>
    </div>
  )
}
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
        <AnalyticsRenderer />
      </div>

      <AnalyticsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        analytics={dummyAnalytics}
      />
    </div>
  )
}

export default AnalyticsTab
