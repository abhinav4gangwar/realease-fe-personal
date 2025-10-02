"use client"

import { Button } from "@/components/ui/button"
import { dummyAnalytics } from "@/lib/analytics.dummy"
import { ChartType, ReportBlock } from "@/types/report-types"
import { ArrowDown, ArrowUp, Trash } from "lucide-react"

import { useId } from "react"
import ReportAnalyticsBasicCard from "./report-analytics-basic-card"
import { ReportAnalyticsChartCard } from "./report-analytics-chart-card"

export interface ReportCanvasProps {
  blocks: ReportBlock[]
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onRemove: (index: number) => void
  onChangeText: (index: number, text: string) => void
  onChangeChartType: (index: number, chartType: ChartType) => void
  containerId?: string
}

export default function ReportCanvas({
  blocks,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChangeText,
  onChangeChartType,
  containerId,
}: ReportCanvasProps) {
  const fallbackId = useId()
  const id = containerId || `report-canvas-${fallbackId}`

  return (
    <section className="flex-1 overflow-auto">
      <div id={id} className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {blocks.length === 0 && (
          <div className="col-span-1 rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 md:col-span-2">
            Select analytics from the sidebar or add text blocks to build your report.
          </div>
        )}

        {blocks.map((block, index) => {
          const controls = (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMoveUp(index)}
                aria-label="Move block up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMoveDown(index)}
                aria-label="Move block down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600"
                onClick={() => onRemove(index)}
                aria-label="Remove block"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )

          if (block.kind === "text") {
            return (
              <div key={block.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="mb-2">{controls}</div>
                <textarea
                  className="h-36 w-full resize-vertical rounded border border-gray-300 p-3 text-sm outline-none"
                  value={block.text}
                  onChange={(e) => onChangeText(index, e.target.value)}
                  placeholder="Type your notes, explanations, or section headings here..."
                  aria-label="Report text block"
                />
              </div>
            )
          }

          // analytics block
          const card = dummyAnalytics.cards.find((c) => c.id === block.analyticsId)
          if (!card) {
            return (
              <div key={block.id} className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Missing analytics card: {block.analyticsId}
              </div>
            )
          }

          return (
            <div key={block.id} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-2">{controls}</div>

              {card.type === "basic" ? (
                <ReportAnalyticsBasicCard heading={card.title} value={card.value} insight={card.insight} color={card.color} />
              ) : (
                <ReportAnalyticsChartCard
                  defaultChart={card.chartType}
                  chartType={block.chartType}
                  onChartTypeChange={(t) => onChangeChartType(index, t)}
                  data={card.data}
                  title={card.title}
                  insight={card.insight}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
