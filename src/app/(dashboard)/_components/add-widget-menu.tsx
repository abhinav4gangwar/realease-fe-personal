'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PreviewAssetsAnalyticsWidget } from './widgets/assets-analytics-widget'
import { PreviewAssetsLitigationWidget } from './widgets/assets-litigation-widget'
import { PreviewMiniMapWidget } from './widgets/mini-map-widget'
import { PreviewRecentCommentWidget } from './widgets/recent-comments-widget'
import { PreviewTotalAssetsWidget } from './widgets/total-assets-widget'

interface AddWidgetDropdownProps {
  onAddWidget: (widgetType: string) => void
}

const AddWidgetButton = ({ onAddWidget }: AddWidgetDropdownProps) => {
  const [open, setOpen] = useState(false)
  const handleAddWidget = (widgetType: string) => {
    onAddWidget(widgetType)
    setOpen(false)
  }

  const widgetPreviews = [
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
    // {
    //   type: 'upcoming-dates',
    //   title: 'Upcoming Dates',
    //   component: <PreviewHearingDateWidget />,
    // },
    {
      type: 'analytics',
      title: 'Analytics Chart',
      component: <PreviewAssetsAnalyticsWidget />,
    },
    {
      type: 'asset-value',
      title: 'Asset Value',
      component: <PreviewTotalAssetsWidget />,
    },
    {
      type: 'litigation',
      title: 'Litigation Status',
      component: <PreviewAssetsLitigationWidget />,
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
            {widgetPreviews.map((widget) => (
              <div
                key={widget.type}
                className="cursor-pointer p-4 transition-colors"
                onClick={() => handleAddWidget(widget.type)}
              >
                <div className="">
                  {widget.component}
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default AddWidgetButton
