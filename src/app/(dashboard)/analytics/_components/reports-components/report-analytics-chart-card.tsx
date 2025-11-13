"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip as Toltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeft,
  ArrowRight,
  ChartColumnIncreasing,
  ChartPie,
  Circle,
  EllipsisVertical,
  Info
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

export const ReportAnalyticsChartCard = ({
  defaultChart,
  data,
  title,
  insight,
  chartType: controlledChartType,
  onChartTypeChange,
}: {
  defaultChart: string | undefined
  data: any | undefined
  title: string | undefined
  insight: string | undefined
  chartType?: "bar" | "pie" | "donut"
  onChartTypeChange?: (type: "bar" | "pie" | "donut") => void
}) => {
  const [chartType, setChartType] = useState<string | undefined>(
    controlledChartType || defaultChart
  )
  const [legendPage, setLegendPage] = useState(0)

  useEffect(() => {
    if (controlledChartType && controlledChartType !== chartType) {
      setChartType(controlledChartType)
    }
  }, [controlledChartType])

  const handleSetType = (t: "bar" | "pie" | "donut") => {
    setChartType(t)
    onChartTypeChange?.(t)
  }

  // Pagination logic (same as Analytics)
  const itemsPerPage = 5
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginatedLegends = data.slice(
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
          {title}
        </CardTitle>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Toltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="hover:text-primary cursor-pointer">
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
          </TooltipProvider>

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
                onClick={() => handleSetType("donut")}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === "donut" ? "text-primary" : ""
                }`}
              >
                <Circle /> Donut Chart
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSetType("pie")}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === "pie" ? "text-primary" : ""
                }`}
              >
                <ChartPie /> Pie Chart
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleSetType("bar")}
                className={`hover:bg-primary/30 my-1 cursor-pointer text-base ${
                  chartType === "bar" ? "text-primary" : ""
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
          
          {/* Chart Section — identical to Analytics */}
          <div className="w-full lg:flex-2">
            <div className="h-[300px] w-full sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                
                {chartType === "donut" && (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      dataKey="value"
                    >
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === "pie" && (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                )}

                {chartType === "bar" && (
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
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}

              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend Section — identical to Analytics */}
          <div className="w-full lg:flex-1">
            <div className="space-y-3 min-h-[160px]">

              {paginatedLegends.map((item: any, index: number) => (
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

                <button disabled={legendPage === totalPages - 1} onClick={nextPage}>
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
