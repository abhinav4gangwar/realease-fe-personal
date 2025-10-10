'use client'
import { useGlobalContextProvider } from '@/providers/global-context'
import AnaLyticsMobileTab from './_mobileTabs/analytics-mobiletab'
import ReportsMobileTab from './_mobileTabs/reports-mobiletab'
import AnalyticsTab from './_tabs/analytics-tab'
import ReportsTab from './_tabs/reports-tab'

const AnalyticsPage = () => {
  const { analyticsState } = useGlobalContextProvider()
  if (analyticsState === 'analytics') {
    return (
      <>
        <div className="hidden lg:block">
          <AnalyticsTab />
        </div>
        <div className="block lg:hidden pt-14">
          <AnaLyticsMobileTab />
        </div>
      </>
    )
  } else if (analyticsState === 'report') {
    return (
      <>
        <div className="hidden lg:block">
          <ReportsTab />
        </div>
        <div className="block lg:hidden pt-14">
          <ReportsMobileTab />
        </div>
      </>
    )
  }
}

export default AnalyticsPage
