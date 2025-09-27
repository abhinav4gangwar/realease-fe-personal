import AnalyticsSTateToggle from "../_components/analytics-state-toggle"

const ReportsTab = () => {
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
        </div>
      </div>

      <div></div>
    </div>
  )
}

export default ReportsTab
