import { Button } from '@/components/ui/button'
import { useGlobalContextProvider } from '@/providers/global-context'

const AnalyticsSTateToggle = () => {
  const { analyticsState, setAnalyticsState } = useGlobalContextProvider()
  return (
    <div className="flex items-center rounded-full border border-gray-400">
      <Button
        onClick={() => setAnalyticsState('analytics')}
        className={`h-12 px-6 ${analyticsState === 'analytics' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent'} cursor-pointer rounded-l-full hover:bg-transparent`}
      >
        Stats
      </Button>

      <Button
        onClick={() => setAnalyticsState('report')}
        className={`h-12 px-6 ${analyticsState === 'report' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent'} cursor-pointer rounded-r-full hover:bg-transparent`}
      >
        Report
      </Button>
    </div>
  )
}

export default AnalyticsSTateToggle
