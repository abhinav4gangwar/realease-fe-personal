import AnalyticsSTateToggle from '../_components/analytics-state-toggle'
import { AnalyticsRenderer } from '../_tabs/analytics-tab'

const AnaLyticsMobileTab = () => {
  return (
    <div className="pb-8">
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold">Analytics</div>
        </div>

        <div className="flex items-center gap-4">
          <AnalyticsSTateToggle />
        </div>
      </div>

      <div className="flex flex-col space-y-4 py-4">
        <AnalyticsRenderer />
      </div>
    </div>
  )
}

export default AnaLyticsMobileTab
