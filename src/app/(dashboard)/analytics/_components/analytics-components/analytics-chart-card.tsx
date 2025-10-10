'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip as Toltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ChartColumnIncreasing,
  ChartPie,
  Circle,
  EllipsisVertical,
  Info,
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const AnalyticsChartCard = ({
  defaultChart,
  data,
  title,
  insight,
}: {
  defaultChart: string | undefined
  data: any | undefined
  title: string | undefined
  insight: string | undefined
}) => {
  const [chartType, setChartType] = useState(defaultChart)

  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary mb-4 h-2 pb-3 text-base font-normal">
          {title}
        </CardTitle>

        <div className="flex items-center">
          <Toltip>
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
          </Toltip>
          {/* 3-dot Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer rounded-full p-2 transition hover:bg-gray-100">
                <EllipsisVertical className="h-5 w-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-300 px-4">
              <div className="border-b border-gray-400 p-2 font-semibold">
                Chart Type
              </div>
              <DropdownMenuItem
                onClick={() => setChartType('donut')}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === 'donut' ? 'text-primary' : ''
                }`}
              >
                <Circle /> Donut Chart
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setChartType('pie')}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === 'pie' ? 'text-primary' : ''
                }`}
              >
                <ChartPie /> Pie Chart
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setChartType('bar')}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === 'bar' ? 'text-primary' : ''
                }`}
              >
                <ChartColumnIncreasing /> Bar Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-10">
          {/* Chart Section */}
          <div className="w-full lg:flex-2">
            {/* Mobile: smaller height, Desktop: original height */}
            <div className="h-[240px] w-full sm:h-[287px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'donut' && (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === 'bar' && (
                  <BarChart data={data} margin={{ left: -20, right: 10 }}>
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Section */}
          <div className="w-full space-y-3 lg:flex-1 lg:space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-secondary text-xs">{item.label}</span>
                  <span className="text-xs font-medium text-gray-600">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}