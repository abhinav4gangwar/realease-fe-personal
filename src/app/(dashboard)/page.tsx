'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_ACTIONS_HOME } from '@/lib/constants'
import { GripVertical, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  cardData?: AnalyticsCard
  x: number
  y: number
}

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'recent-activity',
      title: 'Recent Activity Feed',
      width: 700,
      height: 200,
      x: 0,
      y: 0,
    },
  ])
  
  const [savedWidgets, setSavedWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'recent-activity',
      title: 'Recent Activity Feed',
      width: 700,
      height: 200,
      x: 0,
      y: 0,
    },
  ])
  
  const [hasChanges, setHasChanges] = useState(false)
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null)
  const [resizingWidget, setResizingWidget] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [resizeDirection, setResizeDirection] = useState<'horizontal' | 'vertical' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if there are unsaved changes
  useEffect(() => {
    const hasChanged = JSON.stringify(widgets) !== JSON.stringify(savedWidgets)
    setHasChanges(hasChanged)
  }, [widgets, savedWidgets])

  const addWidget = (widgetType: string, cardData?: AnalyticsCard) => {
    const widgetConfig = {
      'recent-comments': { title: 'Recent Comments', width: 700, height: 200 },
      'mini-map': { title: 'Mini Map View', width: 600, height: 500 },
      'upcoming-dates': {
        title: 'Upcoming Hearing Dates',
        width: 400,
        height: 300,
      },
      'analytics-basic': {
        title: cardData?.title || 'Analytics Card',
        width: 350,
        height: 200,
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
        cardData: cardData,
        x: 0,
        y: widgets.length * 320,
      }
      setWidgets([...widgets, newWidget])
    }
  }

  const removeWidget = (widgetId: string) => {
    if (widgetId === '1') return
    setWidgets(widgets.filter((w) => w.id !== widgetId))
  }

  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return

    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    
    setDraggingWidget(widgetId)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    e.stopPropagation()
  }

  const handleResizeMouseDown = (e: React.MouseEvent, widgetId: string, direction: 'horizontal' | 'vertical') => {
    const widget = widgets.find(w => w.id === widgetId)
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
  }

  const canResizeHeight = (widgetType: string) => {
    return widgetType === 'mini-map' || widgetType === 'analytics-chart'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingWidget && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffset.x
      const newY = e.clientY - containerRect.top - dragOffset.y

      setWidgets(prevWidgets => prevWidgets.map(w => 
        w.id === draggingWidget 
          ? { 
              ...w, 
              x: Math.max(0, Math.min(newX, containerRect.width - w.width)),
              y: Math.max(0, newY)
            }
          : w
      ))
    }

    if (resizingWidget && resizeDirection) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      setWidgets(prevWidgets => prevWidgets.map(w => {
        if (w.id === resizingWidget) {
          if (resizeDirection === 'horizontal') {
            return {
              ...w,
              width: Math.max(200, resizeStart.width + deltaX)
            }
          } else if (resizeDirection === 'vertical') {
            return {
              ...w,
              height: Math.max(150, resizeStart.height + deltaY)
            }
          }
        }
        return w
      }))
    }
  }

  const handleMouseUp = () => {
    setDraggingWidget(null)
    setResizingWidget(null)
    setResizeDirection(null)
  }

  useEffect(() => {
    if (draggingWidget || resizingWidget) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingWidget, resizingWidget, dragOffset, resizeStart, widgets])

  const handleSave = async () => {
    const dashboardData = {
      widgets: widgets.map(w => ({
        id: w.id,
        type: w.type,
        title: w.title,
        width: w.width,
        height: w.height,
        x: w.x,
        y: w.y,
        cardData: w.cardData,
      })),
      timestamp: new Date().toISOString(),
    }

    console.log('Saving dashboard configuration:', dashboardData)
    
    // TODO: Replace with actual API call
    // await apiClient.post('/dashboard/save', dashboardData)
    
    setSavedWidgets([...widgets])
    setHasChanges(false)
  }

  const handleCancel = () => {
    setWidgets([...savedWidgets])
    setHasChanges(false)
  }

  const renderWidget = (widget: Widget) => {
    const isDragging = draggingWidget === widget.id
    const isResizing = resizingWidget === widget.id

    const WidgetWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        style={{
          position: 'absolute',
          left: `${widget.x}px`,
          top: `${widget.y}px`,
          width: `${widget.width}px`,
          height: `${widget.height}px`,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        className={`group ${isDragging || isResizing ? 'z-50' : 'z-10'} transition-shadow hover:shadow-lg`}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={(e) => handleMouseDown(e, widget.id)}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded p-1 shadow-md"
        >
          <GripVertical className="h-5 w-5 text-gray-600" />
        </div>

        {/* Remove Button */}
        {widget.id !== '1' && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-20 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 bg-white shadow-md"
            onClick={() => removeWidget(widget.id)}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        )}

        {/* Resize Handle - Right Edge (Width) - All widgets */}
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, widget.id, 'horizontal')}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400 transition-all z-20"
        />
        
        {/* Resize Handle - Bottom Edge (Height) - Only for map and charts */}
        {canResizeHeight(widget.type) && (
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, widget.id, 'vertical')}
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400 transition-all z-20"
          />
        )}

        <div className="w-full h-full overflow-auto">
          {children}
        </div>
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

          <div className="flex gap-3 items-center">
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
                  className="h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Save Changes
                </Button>
              </>
            )}
            <AddWidgetButton onAddWidget={addWidget} />
            <QuickActionMenu quickActionOptions={QUICK_ACTIONS_HOME} />
          </div>
        </div>

        <div 
          ref={containerRef}
          className="relative pt-4 min-h-screen bg-gray-50/50 rounded-lg"
          style={{ minHeight: '1000px' }}
        >
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