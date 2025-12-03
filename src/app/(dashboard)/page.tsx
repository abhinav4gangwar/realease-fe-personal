'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_ACTIONS_HOME } from '@/lib/constants'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import AddWidgetButton from './_components/add-widget-menu'
import QuickActionMenu from './_components/quick-action-menu'
import {
  AnalyticsBasicWidget,
  AnalyticsChartWidget,
} from './_components/widgets/analytics-widgets/analytics-dashboard-widgets'
import { HearingDateWidget } from './_components/widgets/hearing-date-widget'
import { MiniMapWidget } from './_components/widgets/mini-map-widget'
import RecentACtivityWidget from './_components/widgets/recent-activity-widget'
import { RecentCommentWidget } from './_components/widgets/recent-comments-widget'
import { AnalyticsCard } from './analytics/_tabs/analytics-tab'

export interface Widget {
  id: string
  type: string
  title: string
  size: 'half' | 'full'
  cardData?: AnalyticsCard
}

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'recent-activity',
      title: 'Recent Activity Feed',
      size: 'half',
    },
  ])

  const addWidget = (widgetType: string, cardData?: AnalyticsCard) => {
    const widgetConfig = {
      'recent-comments': { title: 'Recent Comments', size: 'half' as const },
      'mini-map': { title: 'Mini Map View', size: 'full' as const },
      'upcoming-dates': {
        title: 'Upcoming Hearing Dates',
        size: 'half' as const,
      },
      'analytics-basic': {
        title: cardData?.title || 'Analytics Card',
        size: 'half' as const,
      },
      'analytics-chart': {
        title: cardData?.title || 'Analytics Chart',
        size: 'half' as const,
      },
    }[widgetType]

    if (widgetConfig) {
      const newWidget: Widget = {
        id: Date.now().toString(),
        type: widgetType,
        title: widgetConfig.title,
        size: widgetConfig.size,
        cardData: cardData,
      }
      setWidgets([...widgets, newWidget])
    }
  }

  const removeWidget = (widgetId: string) => {
    if (widgetId === '1') return
    setWidgets(widgets.filter((w) => w.id !== widgetId))
  }

  const renderWidget = (widget: Widget) => {
    const WidgetWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={`relative ${widget.size === 'full' ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}
      >
        {widget.id !== '1' && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-10 w-10 p-0 hover:bg-red-100"
            onClick={() => removeWidget(widget.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {children}
      </div>
    )

    switch (widget.type) {
      case 'recent-activity':
        return (
          <WidgetWrapper key={widget.id}>
            <RecentACtivityWidget />
          </WidgetWrapper>
        )
      case 'recent-comments':
        return (
          <WidgetWrapper key={widget.id}>
            <RecentCommentWidget />
          </WidgetWrapper>
        )
      case 'mini-map':
        return (
          <WidgetWrapper key={widget.id}>
            <MiniMapWidget />
          </WidgetWrapper>
        )
      case 'upcoming-dates':
        return (
          <WidgetWrapper key={widget.id}>
            <HearingDateWidget />
          </WidgetWrapper>
        )
      case 'analytics-basic':
        return widget.cardData ? (
          <WidgetWrapper key={widget.id}>
            <AnalyticsBasicWidget card={widget.cardData} />
          </WidgetWrapper>
        ) : null
      case 'analytics-chart':
        return widget.cardData ? (
          <WidgetWrapper key={widget.id}>
            <AnalyticsChartWidget card={widget.cardData} />
          </WidgetWrapper>
        ) : null
      default:
        return null
    }
  }

  return (
    <div>
      {/* for desktop */}
      <div className="hidden lg:block">
        <div className="flex justify-between pb-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Dashboard
          </div>

          <div className="flex gap-6">
            <AddWidgetButton onAddWidget={addWidget} />
            <QuickActionMenu quickActionOptions={QUICK_ACTIONS_HOME} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
          {widgets.map(renderWidget)}
        </div>
      </div>

      {/* for mobile */}

      <div className="block pt-14 lg:hidden">
        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="relative w-full">
            <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Anywhere Search"
              className="h-14 w-full bg-white pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
