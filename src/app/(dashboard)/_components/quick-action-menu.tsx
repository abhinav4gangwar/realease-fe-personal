"use client"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const QuickActionMenu = () => {
  const [open, setOpen] = useState(false)

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
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Create Property</DropdownMenuItem>
        <DropdownMenuItem>Add Document</DropdownMenuItem>
        <DropdownMenuItem>Generate Report</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickActionMenu
