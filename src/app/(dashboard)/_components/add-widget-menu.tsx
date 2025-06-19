import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'

const AddWidgetButton = () => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-1 h-11 font-semibold text-secondary">
            <Plus className="h-6 w-6 " />
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
