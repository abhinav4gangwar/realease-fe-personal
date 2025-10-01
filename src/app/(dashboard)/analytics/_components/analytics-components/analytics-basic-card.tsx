import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface CardTypes {
  heading: string | undefined
  value: string | undefined
  insight: string | undefined
  color: string | undefined
}

const AnalyticsBasicCard = ({ heading, value, insight, color }: CardTypes) => {
  return (
    <div className="rounded-md bg-white p-5">
      <div className="text-secondary flex items-center justify-between">
        <p>{heading}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="hover:text-primary cursor-pointer"
            >
              <Info className="hover:text-primary size-5 font-semibold text-[#9B9B9D]" />
            </Button>
          </TooltipTrigger>

          <TooltipContent
            side="bottom"
            className="text-secondary max-w-sm border border-gray-400 bg-white shadow-md"
          >
            <p className="text-base font-bold">Insight</p>
            <p className="pt-1">{insight}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="pt-3">
        <p className={`text-${color} text-4xl font-semibold`}>{value}</p>
      </div>
    </div>
  )
}

export default AnalyticsBasicCard
