'use client'

import { Input } from '@/components/ui/input'
import { Bell, CircleUser, Search } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  return (
    <header className="z-40 bg-white px-6 py-4 shadow-sm hidden lg:block">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="mx-8 hidden max-w-6xl flex-1 lg:block">
          <div className="relative">
            <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Anywhere Search"
              className="h-12 w-full pl-10"
            />
          </div>
        </div>

        <div className="block lg:hidden">
          <Image
            src="/assets/logo-black.png"
            alt="logo"
            height={30}
            width={110}
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6 lg:pr-8">
          <Bell className="h-7 w-7" />
          <CircleUser className="h-8 w-8" />
        </div>
      </div>
    </header>
  )
}
