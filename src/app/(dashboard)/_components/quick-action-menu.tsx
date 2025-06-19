'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QUICK_ACTIONS } from '@/lib/constants'
import { QuickAction } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const QuickActionMenu = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null)

  const handleActionSelect = (action: QuickAction): void => {
    setSelectedAction(action)
    setOpen(false)

    console.log('Selected action:', selectedAction)
  }


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${
            open
              ? 'text-primary bg-white'
              : 'bg-primary hover:bg-secondary text-white'
          }`}
        >
          <span>Quick Actions</span>
          {open ? (
            <ChevronUp className="text-primary h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="border-none">
        {QUICK_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => handleActionSelect(action)}
            className={`cursor-pointer hover:bg-[#A2CFE33D] font-semibold ${(action.id === selectedAction?.id)? "text-primary": "text-secondary"}`}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickActionMenu
