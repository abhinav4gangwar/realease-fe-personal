'use client'
import { useGlobalContextProvider } from '@/providers/global-context'
import AnalyticsTab from './_tabs/analytics-tab'
import ReportsTab from './_tabs/reports-tab'

const AnalyticsPage = () => {
  const { analyticsState } = useGlobalContextProvider()
  if (analyticsState === 'analytics') {
    return <AnalyticsTab />
  } else if (analyticsState === 'report') {
    return <ReportsTab />
  }
}

export default AnalyticsPage
