'use client'

import { Input } from '@/components/ui/input'
import { Bell, CircleUser, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white px-6 py-4 shadow-sm z-40">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="mx-8 max-w-6xl flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform text-secondary" />
            <Input
              type="text"
              placeholder="Anywhere Search"
              className="w-full pl-10 h-12"
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6 pr-8">
          
            <Bell className="h-7 w-7" />
         

         
            <CircleUser className="h-8 w-8" />
        </div>
      </div>
    </header>
  )
}
