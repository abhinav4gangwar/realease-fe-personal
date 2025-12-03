'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiClient } from '@/utils/api'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnalyticsCard } from '../analytics/_tabs/analytics-tab'
import { PreviewAnalyticsBasicCard, PreviewAnalyticsChartCard } from './widgets/analytics-widgets/analytics-preview-widgets'
import { PreviewMiniMapWidget } from './widgets/mini-map-widget'
import { PreviewRecentCommentWidget } from './widgets/recent-comments-widget'




interface AddWidgetDropdownProps {
  onAddWidget: (widgetType: string, cardData?: AnalyticsCard) => void
}

const AddWidgetButton = ({ onAddWidget }: AddWidgetDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [analyticsCards, setAnalyticsCards] = useState<AnalyticsCard[]>([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true)
      try {
        const response = await apiClient.get('/analytics')
        if (response.data?.cards) {
          setAnalyticsCards(response.data.cards)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }
    
    if (open) {
      fetchAnalytics()
    }
  }, [open])

  const handleAddWidget = (widgetType: string, cardData?: AnalyticsCard) => {
    onAddWidget(widgetType, cardData)
    setOpen(false)
  }

  // Static widgets
  const staticWidgets = [
    {
      type: 'recent-comments',
      title: 'Recent Comments',
      component: <PreviewRecentCommentWidget />,
    },
    {
      type: 'mini-map',
      title: 'Mini Map View',
      component: <PreviewMiniMapWidget />,
    },
  ]

  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex h-11 items-center space-x-1 font-semibold ${open ? 'text-secondary border-none bg-white' : 'hover:bg-secondary text-secondary hover:text-white'}`}
          >
            <Plus className="h-6 w-6" />
            <span>Add Widgets</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[500px] lg:w-[450px] w-[300px] overflow-y-auto border-none p-0 z-[9999999]"
        >
          <div>
            {/* Static Widgets */}
            {staticWidgets.map((widget) => (
              <div
                key={widget.type}
                className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                onClick={() => handleAddWidget(widget.type)}
              >
                {widget.component}
              </div>
            ))}

            {/* Analytics Section Header */}
            {analyticsCards.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 border-y border-gray-200">
                <p className="text-xs font-semibold text-gray-600">ANALYTICS WIDGETS</p>
              </div>
            )}

            {/* Loading State */}
            {isLoadingAnalytics && (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading analytics...
              </div>
            )}

            {/* Analytics Cards */}
            {analyticsCards.map((card) => (
              <div
                key={card.id}
                className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                onClick={() => handleAddWidget(
                  card.type === 'basic' ? 'analytics-basic' : 'analytics-chart',
                  card
                )}
              >
                {card.type === 'basic' ? (
                  <PreviewAnalyticsBasicCard card={card} />
                ) : (
                  <PreviewAnalyticsChartCard card={card} />
                )}
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default AddWidgetButton