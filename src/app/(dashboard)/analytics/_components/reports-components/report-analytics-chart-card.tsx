"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip as Toltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    ChartColumnIncreasing,
    ChartPie,
    Circle,
    EllipsisVertical,
    Info,
} from 'lucide-react'
import { useEffect, useState } from "react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, YAxis } from "recharts"

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
  const [chartType, setChartType] = useState<string | undefined>(controlledChartType || defaultChart)

  useEffect(() => {
    if (controlledChartType && controlledChartType !== chartType) {
      setChartType(controlledChartType)
    }
  }, [controlledChartType])

  const handleSetType = (t: "bar" | "pie" | "donut") => {
    setChartType(t)
    onChartTypeChange?.(t)
  }

  return (
    <Card className="w-full border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-secondary mb-4 h-2 pb-3 text-base font-normal">{title}</CardTitle>

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
          {/* 3-dot Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer rounded-full p-2 transition hover:bg-gray-100">
                <EllipsisVertical className="h-5 w-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-300 px-4">
              <div className="border-b border-gray-400 p-2 font-semibold">Chart Type</div>
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
          {/* Chart Section */}
          <div className="flex-2">
            <ResponsiveContainer width="100%" height={287}>
              {chartType === "donut" && (
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={90} dataKey="value">
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              )}

              {chartType === "pie" && (
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value">
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              )}

              {chartType === "bar" && (
                <BarChart data={data}>
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend Section */}
          <div className="flex-1 space-y-4">
            <div className="space-y-4">
              {data.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex gap-4">
                    <span className="text-secondary text-xs">{item.label}</span>
                    <span className="text-xs text-gray-600">{item.percentage}%</span>
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
