import AnalyticsBasicCard from '../_components/analytics-components/analytics-basic-card'
import { AnalyticsChartCard } from '../_components/analytics-components/analytics-chart-card'
import AnalyticsSTateToggle from '../_components/analytics-state-toggle'

const AnalyticsTab = () => {
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
        </div>
      </div>

      <div className="py-4 flex flex-col space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
          <AnalyticsChartCard />
          <AnalyticsChartCard />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsTab
