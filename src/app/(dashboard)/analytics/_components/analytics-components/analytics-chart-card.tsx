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

const assetData = [
  { city: 'Mumbai', percentage: 38, value: 380, color: '#A2CFE3' },
  { city: 'Bengaluru', percentage: 30, value: 300, color: '#F16F70' },
  { city: 'Hyderabad', percentage: 19, value: 190, color: '#C1B5E4' },
  { city: 'Delhi', percentage: 13, value: 130, color: '#5C9FAD' },
]

export const AnalyticsChartCard = () => {
  const [chartType, setChartType] = useState<'donut' | 'pie' | 'bar'>('donut')

  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary mb-4 h-2 pb-3 text-base font-normal">
          Asset Location Distribution
        </CardTitle>

        <div>
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
              <p className="pt-1">
                This chart displays the distribution of assets by Number,
                highlighting the concentration across different Cities
              </p>
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
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
          {/* Chart Section */}
          <div className="flex-2">
            <ResponsiveContainer width="100%" height={287}>
              {chartType === 'donut' && (
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              )}

              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              )}

              {chartType === 'bar' && (
                <BarChart data={assetData}>
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend Section */}
          <div className="flex-1 space-y-4">
            <h3 className="text-md text-secondary mb-6 font-semibold">
              Assets by City
            </h3>
            <div className="space-y-4">
              {assetData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex gap-4">
                    <span className="text-secondary">{item.city}</span>
                    <span className="text-sm text-gray-600">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
