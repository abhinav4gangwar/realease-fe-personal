"use client"

import { Button } from "@/components/ui/button"

import { AnalyticsCard, ChartType, ReportBlock } from "@/types/report-types"
import { ArrowDown, ArrowUp, Trash } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { toast } from "sonner"
import ReportAnalyticsBasicCard from "./report-analytics-basic-card"
import { ReportAnalyticsChartCard } from "./report-analytics-chart-card"
import { fetchAnalytics } from "./report_utils/report.services"

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
  const [analytics, setAnalytics] = useState<AnalyticsCard[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // Fetch analytics data for rendering blocks
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoadingAnalytics(true)
        const response = await fetchAnalytics()
        if (response.cards) {
          setAnalytics(response.cards)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        toast.error('Failed to load analytics data')
      } finally {
        setLoadingAnalytics(false)
      }
    }
    
    loadAnalytics()
  }, [])

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
                className="h-7 w-7 text-red-600 hover:text-red-700"
                onClick={() => onRemove(index)}
                aria-label="Remove block"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )

          // Text block
          if (block.kind === "text") {
            return (
              <div key={block.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="mb-2">{controls}</div>
                <textarea
                  className="h-36 w-full resize-vertical rounded border border-gray-300 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={block.text}
                  onChange={(e) => onChangeText(index, e.target.value)}
                  placeholder="Type your notes, explanations, or section headings here..."
                  aria-label="Report text block"
                />
              </div>
            )
          }

          // Analytics block - loading state
          if (loadingAnalytics) {
            return (
              <div key={block.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="mb-2">{controls}</div>
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  <div className="text-center">
                    <div className="mb-2">Loading analytics...</div>
                    <div className="text-xs text-gray-400">ID: {block.analyticsId}</div>
                  </div>
                </div>
              </div>
            )
          }

          // Analytics block - find card
          const card = analytics.find((c) => c.id === block.analyticsId)
          
          // Analytics block - not found
          if (!card) {
            return (
              <div key={block.id} className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="mb-2">{controls}</div>
                <div className="rounded-md bg-white p-4 text-sm text-red-700">
                  <div className="font-semibold">Analytics card not found</div>
                  <div className="mt-1 text-xs">
                    Card ID: {block.analyticsId} may have been deleted.
                  </div>
                </div>
              </div>
            )
          }

          // Analytics block - render
          return (
            <div key={block.id} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-2">{controls}</div>

              {card.type === "basic" ? (
                <ReportAnalyticsBasicCard 
                  heading={card.title} 
                  value={card.value || '0'} 
                  insight={card.insight} 
                  color={card.color} 
                />
              ) : (
                <ReportAnalyticsChartCard
                  defaultChart={card.chartType}
                  chartType={block.chartType || card.chartType}
                  onChartTypeChange={(t) => onChangeChartType(index, t)}
                  data={card.data || []}
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