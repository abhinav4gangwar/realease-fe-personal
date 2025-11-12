import { Button } from "@/components/ui/button"
import { AnalyticsCard, ChartType } from "@/types/report-types"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

export interface ReportSidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  selectedIds: string[]
  onToggleAnalytic: (id: string) => void
  onAddTextBlock: () => void
  onSetChartType: (id: string, chartType: ChartType) => void
  analytics: AnalyticsCard[]
  loadingAnalytics?: boolean
}

export default function ReportSidebar({
  collapsed,
  onToggleCollapsed,
  selectedIds,
  onToggleAnalytic,
  onAddTextBlock,
  analytics,
  loadingAnalytics = false,
}: ReportSidebarProps) {
  return (
    <aside
      className={`relative border-r border-gray-200 bg-white transition-all duration-200 ${
        collapsed ? "w-12" : "w-80"
      }`}
      aria-label="Report analytics selector"
    >
      <div className="flex items-center justify-between px-3 py-2">
        {!collapsed && <h3 className="text-sm font-semibold">Analytics</h3>}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand analytics sidebar" : "Collapse analytics sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="space-y-2 overflow-y-auto p-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {loadingAnalytics ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Loading analytics...
            </div>
          ) : analytics.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No analytics available.<br />Create analytics first.
            </div>
          ) : (
            analytics.map((card) => (
              <div
                key={card.id}
                className={`rounded-md border p-3 text-sm transition-colors ${
                  selectedIds.includes(card.id) 
                    ? "border-primary/60 bg-primary/5" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 font-medium">{card.title}</div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#f16969]"
                      checked={selectedIds.includes(card.id)}
                      onChange={() => onToggleAnalytic(card.id)}
                      aria-label={`Toggle ${card.title} in report`}
                    />
                  </label>
                </div>
              </div>
            ))
          )}

          <Button
            variant="outline"
            className="mt-4 w-full bg-transparent"
            onClick={onAddTextBlock}
            aria-label="Add text block to report"
          >
            <Plus className="mr-2 h-4 w-4 text-primary" />
            Add text block
          </Button>
        </div>
      )}
    </aside>
  )
}