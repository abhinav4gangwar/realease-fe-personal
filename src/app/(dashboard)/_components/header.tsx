'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Bell, ChevronDown, Plus, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">title</h1>
        </div>

        {/* Search Bar */}
        <div className="mx-8 max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Anywhere Search"
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Widgets</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center space-x-2 bg-red-500 text-white hover:bg-red-600">
                <span>Quick Actions</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Create Property</DropdownMenuItem>
              <DropdownMenuItem>Add Document</DropdownMenuItem>
              <DropdownMenuItem>Generate Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
