'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AnalyticsCard } from '@/types/report-types'
import {
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'



// Basic Analytics Widget - receives card data as prop
export const AnalyticsBasicWidget = ({ card }: { card: AnalyticsCard }) => {
  return (
    <Card className="w-full border-none">
      <CardContent className="p-5">
        <div className="text-secondary flex items-center justify-between">
          <p>{card.title}</p>
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
              <p className="pt-1">{card.insight}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="pt-3">
          <p className={`text-[${card.color}] text-4xl font-semibold`}>
            {card.value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Chart Analytics Widget - receives card data as prop
export const AnalyticsChartWidget = ({ card: initialCard }: { card: AnalyticsCard }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut'>(initialCard.chartType || 'donut')
  const [legendPage, setLegendPage] = useState(0)

  if (!initialCard.data) {
    return (
      <Card className="w-full border-none">
        <CardContent className="p-5">
          <div className="text-gray-400">No chart data available</div>
        </CardContent>
      </Card>
    )
  }

  const itemsPerPage = 5
  const totalPages = Math.ceil(initialCard.data.length / itemsPerPage)

  const paginatedLegends = initialCard.data.slice(
    legendPage * itemsPerPage,
    legendPage * itemsPerPage + itemsPerPage
  )

  const nextPage = () => {
    if (legendPage < totalPages - 1) setLegendPage((p) => p + 1)
  }

  const prevPage = () => {
    if (legendPage > 0) setLegendPage((p) => p - 1)
  }

  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary mb-4 h-2 pb-3 text-base font-normal">
          {initialCard.title}
        </CardTitle>

        <div className="flex items-center">
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
              <p className="pt-1">{initialCard.insight}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
          {/* CHART SECTION */}
          <div className="w-full lg:flex-2">
            <div className="h-[300px] w-full sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'donut' && (
                  <PieChart>
                    <Pie
                      data={initialCard.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      dataKey="value"
                    >
                      {initialCard.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={initialCard.data}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {initialCard.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === 'bar' && (
                  <BarChart data={initialCard.data} margin={{ left: -20, right: 10 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {initialCard.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* LEGEND SECTION */}
          <div className="w-full lg:flex-1">
            <div className="space-y-3 min-h-[160px]">
              {paginatedLegends.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-secondary text-xs">{item.label}</span>
                    <span className="text-xs font-medium text-gray-600">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <button disabled={legendPage === 0} onClick={prevPage}>
                  <ArrowLeft className="size-5 cursor-pointer" />
                </button>

                <span className="text-xs secondary">
                  {legendPage + 1} / {totalPages}
                </span>

                <button
                  disabled={legendPage === totalPages - 1}
                  onClick={nextPage}
                >
                  <ArrowRight className="size-5 cursor-pointer" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}