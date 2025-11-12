'use client'

import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'
import { Grid2x2Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AnalyticsBasicCard from '../_components/analytics-components/analytics-basic-card'
import { AnalyticsChartCard } from '../_components/analytics-components/analytics-chart-card'
import AnalyticsSidebar from '../_components/analytics-components/analytics-sidebar'
import AnalyticsStateToggle from '../_components/analytics-state-toggle'


interface AnalyticsCard {
  id: string
  type: 'basic' | 'chart'
  title: string
  insight?: string
  analyticsType: 'standalone' | 'comparative'
  metricType: 'count' | 'value'
  color?: string
  value?: string
  chartType?: 'bar' | 'pie' | 'donut'
  data?: Array<{
    label: string
    value: number
    percentage: number
    color: string
  }>
}

interface AnalyticsData {
  cards: AnalyticsCard[]
}

export const AnalyticsRenderer = ({
  analytics,
  isLoading,
}: {
  analytics: AnalyticsData | null
  isLoading: boolean
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics || analytics.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-gray-500 text-lg">No analytics cards yet</div>
        <div className="text-gray-400 text-sm mt-2">
          Click the + button to create your first analytics card
        </div>
      </div>
    )
  }

  const basicCards = analytics.cards.filter((card) => card.type === 'basic')
  const chartCards = analytics.cards.filter((card) => card.type === 'chart')

  return (
    <div className="flex flex-col space-y-6">
      {/* Basic Cards */}
      {basicCards.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          {basicCards.map((card) => (
            <AnalyticsBasicCard
              key={card.id}
              heading={card.title}
              color={card.color}
              value={card.value}
              insight={card.insight}
            />
          ))}
        </div>
      )}

      {/* Chart Cards */}
      {chartCards.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          {chartCards.map((card) => (
            <AnalyticsChartCard
              key={card.id}
              defaultChart={card.chartType}
              data={card.data}
              title={card.title}
              insight={card.insight}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const AnalyticsTab = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/analytics')
      if (response.data) {
        setAnalytics(response.data)
        toast.message("Analytics Fetched Successfully")
      }
    } catch (err: any) {
      toast.message("Failed to load Analytics")
      console.error('Failed to fetch analytics:', err)
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleAnalyticsCreated = () => {
    // Refresh analytics after creating a new one
    fetchAnalytics()
  }

  const handleAnalyticsDeleted = () => {
    // Refresh analytics after deleting one
    fetchAnalytics()
  }

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Analytics
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnalyticsStateToggle />

          <Button
            className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Grid2x2Plus className="size-6" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchAnalytics}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col space-y-4 py-4">
        <AnalyticsRenderer analytics={analytics} isLoading={isLoading} />
      </div>

      <AnalyticsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        analytics={analytics}
        onAnalyticsCreated={handleAnalyticsCreated}
        onAnalyticsDeleted={handleAnalyticsDeleted}
      />
    </div>
  )
}

export default AnalyticsTab