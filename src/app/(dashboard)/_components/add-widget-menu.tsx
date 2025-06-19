'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { useState } from 'react'

const AddWidgetButton = () => {
  const [open, setOpen] = useState(false)
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Create Property</DropdownMenuItem>
          <DropdownMenuItem>Add Document</DropdownMenuItem>
          <DropdownMenuItem>Generate Report</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default AddWidgetButton
