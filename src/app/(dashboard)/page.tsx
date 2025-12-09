'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_ACTIONS_HOME } from '@/lib/constants'
import { apiClient } from '@/utils/api'
import { GripVertical, Search, X } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
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
  width: number
  height: number
  analyticsCardId?: string
  x: number
  y: number
}

const WidgetContent = memo(
  ({
    type,
    analyticsCardId,
    analyticsCards,
  }: {
    type: string
    analyticsCardId?: string
    analyticsCards: AnalyticsCard[]
  }) => {
    const cardData = analyticsCardId
      ? analyticsCards.find((card) => card.id === analyticsCardId)
      : undefined

    switch (type) {
      case 'recent-activity':
        return <RecentACtivityWidget />
      case 'recent-comments':
        return <RecentCommentWidget />
      case 'mini-map':
        return <MiniMapWidget />
      case 'upcoming-dates':
        return <HearingDateWidget />
      case 'analytics-basic':
        return cardData ? <AnalyticsBasicWidget card={cardData} /> : null
      case 'analytics-chart':
        return cardData ? <AnalyticsChartWidget card={cardData} /> : null
      default:
        return null
    }
  }
)

WidgetContent.displayName = 'WidgetContent'

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [savedWidgets, setSavedWidgets] = useState<Widget[]>([])
  const [analyticsCards, setAnalyticsCards] = useState<AnalyticsCard[]>([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null)
  const [resizingWidget, setResizingWidget] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [resizeDirection, setResizeDirection] = useState<
    'horizontal' | 'vertical' | null
  >(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [analyticsResponse, dashboardResponse] = await Promise.all([
          apiClient.get('/analytics'),
          apiClient.get('/dashboard/config'),
        ])

        if (analyticsResponse.data?.cards) {
          setAnalyticsCards(analyticsResponse.data.cards)
        }

        if (dashboardResponse.data?.config?.widgets) {
          const loadedWidgets = dashboardResponse.data.config.widgets.map(
            (w: any) => ({
              id: w.id,
              type: w.type,
              title: w.title,
              width: w.width,
              height: w.height,
              x: w.position.x,
              y: w.position.y,
              analyticsCardId: w.analyticsCardId,
            })
          )
          setWidgets(loadedWidgets)
          setSavedWidgets(loadedWidgets)
          toast.message(
            'Your dashboard configuration has been loaded successfully.'
          )
        } else {
          const defaultWidget = {
            id: '1',
            type: 'recent-activity',
            title: 'Recent Activity Feed',
            width: 700,
            height: 200,
            x: 0,
            y: 0,
          }
          setWidgets([defaultWidget])
          setSavedWidgets([defaultWidget])
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
        toast.message(
          'Failed to load dashboard configuration. Using default layout.'
        )
        const defaultWidget = {
          id: '1',
          type: 'recent-activity',
          title: 'Recent Activity Feed',
          width: 700,
          height: 200,
          x: 0,
          y: 0,
        }
        setWidgets([defaultWidget])
        setSavedWidgets([defaultWidget])
      } finally {
        setIsLoadingDashboard(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const hasChanged = JSON.stringify(widgets) !== JSON.stringify(savedWidgets)
    setHasChanges(hasChanged)
  }, [widgets, savedWidgets])

  const addWidget = useCallback(
    (widgetType: string, cardData?: AnalyticsCard) => {
      const widgetConfig = {
        'recent-comments': {
          title: 'Recent Comments',
          width: 700,
          height: 200,
        },
        'mini-map': { title: 'Mini Map View', width: 0, height: 600 },
        'upcoming-dates': {
          title: 'Upcoming Hearing Dates',
          width: 400,
          height: 300,
        },
        'analytics-basic': {
          title: cardData?.title || 'Analytics Card',
          width: 350,
          height: 170,
        },
        'analytics-chart': {
          title: cardData?.title || 'Analytics Chart',
          width: 500,
          height: 400,
        },
      }[widgetType]

      if (widgetConfig) {
        const newWidget: Widget = {
          id: Date.now().toString(),
          type: widgetType,
          title: widgetConfig.title,
          width: widgetConfig.width,
          height: widgetConfig.height,
          analyticsCardId: cardData?.id,
          x: 0,
          y: widgets.length * 320,
        }
        setWidgets((prev) => [...prev, newWidget])
      }
    },
    [widgets.length]
  )

  const removeWidget = useCallback((widgetId: string) => {
    if (widgetId === '1') return
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId))
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      const widget = widgets.find((w) => w.id === widgetId)
      if (!widget) return

      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()

      setDraggingWidget(widgetId)
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      e.stopPropagation()
    },
    [widgets]
  )

  const handleResizeMouseDown = useCallback(
    (
      e: React.MouseEvent,
      widgetId: string,
      direction: 'horizontal' | 'vertical'
    ) => {
      const widget = widgets.find((w) => w.id === widgetId)
      if (!widget) return

      setResizingWidget(widgetId)
      setResizeDirection(direction)
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: widget.width,
        height: widget.height,
      })
      e.stopPropagation()
    },
    [widgets]
  )

  const canResizeHeight = (widgetType: string) => {
    return widgetType === 'analytics-chart'
  }

  const canResize = (widgetType: string) => {
    return widgetType !== 'mini-map'
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        if (draggingWidget && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const newX = e.clientX - containerRect.left - dragOffset.x
          const newY = e.clientY - containerRect.top - dragOffset.y

          setWidgets((prevWidgets) =>
            prevWidgets.map((w) =>
              w.id === draggingWidget
                ? {
                    ...w,
                    x: Math.max(
                      0,
                      Math.min(newX, containerRect.width - w.width)
                    ),
                    y: Math.max(0, newY),
                  }
                : w
            )
          )
        }

        if (resizingWidget && resizeDirection) {
          const deltaX = e.clientX - resizeStart.x
          const deltaY = e.clientY - resizeStart.y

          setWidgets((prevWidgets) =>
            prevWidgets.map((w) => {
              if (w.id === resizingWidget) {
                if (resizeDirection === 'horizontal') {
                  return {
                    ...w,
                    width: Math.max(200, resizeStart.width + deltaX),
                  }
                } else if (resizeDirection === 'vertical') {
                  return {
                    ...w,
                    height: Math.max(150, resizeStart.height + deltaY),
                  }
                }
              }
              return w
            })
          )
        }
      })
    },
    [draggingWidget, resizingWidget, dragOffset, resizeStart, resizeDirection]
  )

  const handleMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    setDraggingWidget(null)
    setResizingWidget(null)
    setResizeDirection(null)
  }, [])

  useEffect(() => {
    if (draggingWidget || resizingWidget) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
      }
    }
  }, [draggingWidget, resizingWidget, handleMouseMove, handleMouseUp])

  const handleSave = useCallback(async () => {
    const dashboardConfig = {
      config: {
        widgets: widgets.map((w) => ({
          id: w.id,
          type: w.type,
          title: w.title,
          width: w.width,
          height: w.height,
          position: { x: w.x, y: w.y },
          analyticsCardId: w.analyticsCardId,
        })),
        timestamp: new Date().toISOString(),
      },
    }

    try {
      await apiClient.post('/dashboard/config', dashboardConfig)
      setSavedWidgets([...widgets])
      setHasChanges(false)
      toast.message('Your dashboard configuration has been saved successfully.')
    } catch (error) {
      console.error('Failed to save dashboard configuration:', error)
      toast.message('Failed to save dashboard configuration. Please try again.')
    }
  }, [widgets, toast])

  const handleCancel = useCallback(() => {
    setWidgets([...savedWidgets])
    setHasChanges(false)
  }, [savedWidgets])

  const renderWidget = useCallback(
    (widget: Widget) => {
      const isDragging = draggingWidget === widget.id
      const isResizing = resizingWidget === widget.id
      const isInteracting = isDragging || isResizing
      const isMapWidget = widget.type === 'mini-map'
      const widgetWidth = isMapWidget ? '100%' : `${widget.width}px`

      return (
        <div
          key={widget.id}
          style={{
            position: 'absolute',
            left: isMapWidget ? '0' : `${widget.x}px`,
            top: `${widget.y}px`,
            width: widgetWidth,
            height: `${widget.height}px`,
            cursor: isDragging ? 'grabbing' : 'default',
            willChange: isInteracting ? 'transform' : 'auto',
          }}
          className={`group ${isInteracting ? 'z-50' : 'z-10'} transition-shadow hover:shadow-lg`}
        >
          <div
            onMouseDown={(e) => handleMouseDown(e, widget.id)}
            className="drag-handle absolute top-2 left-2 z-20 cursor-grab rounded bg-white p-1 opacity-0 shadow-md transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-600" />
          </div>

          {widget.id !== '1' && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-20 h-8 w-8 bg-white p-0 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-100"
              onClick={() => removeWidget(widget.id)}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          )}

          {canResize(widget.type) && (
            <div
              onMouseDown={(e) =>
                handleResizeMouseDown(e, widget.id, 'horizontal')
              }
              className="absolute top-0 right-0 bottom-0 z-20 w-2 cursor-ew-resize opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-400"
            />
          )}

          {canResizeHeight(widget.type) && (
            <div
              onMouseDown={(e) =>
                handleResizeMouseDown(e, widget.id, 'vertical')
              }
              className="absolute right-0 bottom-0 left-0 z-20 h-2 cursor-ns-resize opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-400"
            />
          )}

          <div
            className="h-full w-full overflow-auto"
            style={{ pointerEvents: isInteracting ? 'none' : 'auto' }}
          >
            <WidgetContent
              type={widget.type}
              analyticsCardId={widget.analyticsCardId}
              analyticsCards={analyticsCards}
            />
          </div>
        </div>
      )
    },
    [
      draggingWidget,
      resizingWidget,
      handleMouseDown,
      handleResizeMouseDown,
      removeWidget,
      canResizeHeight,
      canResize,
      analyticsCards,
    ]
  )

  return (
    <div>
      <div className="hidden lg:block">
        <div className="flex justify-between pb-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Dashboard
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-11 font-semibold hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="h-11 bg-green-600 font-semibold text-white hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </>
            )}
            <AddWidgetButton onAddWidget={addWidget} />
            <QuickActionMenu quickActionOptions={QUICK_ACTIONS_HOME} />
          </div>
        </div>

        {isLoadingDashboard ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative min-h-screen rounded-lg bg-gray-50/50 pt-4"
            style={{ minHeight: '1000px' }}
          >
            {widgets.map(renderWidget)}
          </div>
        )}
      </div>

      <div className="block pt-14 lg:hidden">
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
