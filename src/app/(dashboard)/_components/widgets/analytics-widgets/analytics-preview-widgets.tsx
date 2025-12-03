import { AnalyticsCard } from '@/app/(dashboard)/analytics/_tabs/analytics-tab'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, Plus } from 'lucide-react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'


export const PreviewAnalyticsBasicCard = ({ card }: { card: AnalyticsCard }) => {
  return (
    <Card className="group relative w-full border-gray-300 overflow-hidden">
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-[#5C9FAD]/25 text-[#5C9FAD] transition-opacity group-hover:flex">
        <Plus className="h-8 w-8 text-primary" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-secondary text-sm font-semibold truncate">
            {card.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="pt-1">
          <p className={`text-[${card.color}] text-2xl font-semibold`}>
            {card.value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Preview Chart Analytics Card with real data
export const PreviewAnalyticsChartCard = ({ card }: { card: AnalyticsCard }) => {
  // Limit to first 3 items for preview
  const previewData = card.data?.slice(0, 3) || []

  return (
    <Card className="group relative w-full border-gray-300 overflow-hidden">
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-[#5C9FAD]/25 text-[#5C9FAD] transition-opacity group-hover:flex">
        <Plus className="h-8 w-8 text-primary" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-secondary text-sm font-semibold truncate">
            {card.title}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-primary cursor-pointer"
              >
                <Info className="h-4 w-4 text-[#9B9B9D]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-secondary max-w-sm border border-gray-400 bg-white shadow-md"
            >
              <p className="text-xs font-bold">Insight</p>
              <p className="text-xs pt-1">{card.insight}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mini Chart */}
          <div className="h-20 w-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              {(card.chartType === 'donut' || card.chartType === 'pie') ? (
                <PieChart>
                  <Pie
                    data={previewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={card.chartType === 'donut' ? 15 : 0}
                    outerRadius={40}
                    dataKey="value"
                  >
                    {previewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={previewData} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {previewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="flex-1 space-y-1">
            {previewData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-gray-600 truncate">{item.label}</span>
              </div>
            ))}
            {(card.data?.length || 0) > 3 && (
              <div className="text-[10px] text-gray-400">+{(card.data?.length || 0) - 3} more</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}