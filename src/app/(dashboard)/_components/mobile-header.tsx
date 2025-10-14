'use client'

import { MobileNavigationItems } from '@/lib/constants'
import { useLogout } from '@/utils/logout'
import { Bell, CircleUser, LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LogoutModel from './logout-modal'

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false)
  const pathname = usePathname()
  const logout = useLogout()

  return (
    <header className="fixed top-0 z-[1000] block w-full bg-white px-6 py-4 shadow-sm lg:hidden">
      <div className="flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen(true)}>
            <Menu className="h-7 w-7" />
          </button>
          <Image
            src="/assets/logo-black.png"
            alt="logo"
            height={30}
            width={110}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6 lg:pr-8">
          <Bell className="h-7 w-7" />
          <CircleUser className="h-8 w-8" />
        </div>
      </div>

      {/* Fullscreen Slide-in Menu */}
      <div
        className={`fixed inset-0 z-50 transform bg-white text-black transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header of Menu */}
        <div className="flex items-center justify-between border-gray-700 px-6 py-4">
          <Image
            src="/assets/logo-black.png"
            alt="logo"
            height={30}
            width={110}
          />
          <button onClick={() => setMenuOpen(false)}>
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Navigation Items (from Bottombar) */}
        <nav className="flex flex-col space-y-4 p-6">
          {MobileNavigationItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-lg font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-secondary hover:bg-gray-700'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div
            className="test-secondary flex items-center gap-3 rounded-md px-4 py-3 text-lg font-medium transition-colors"
            onClick={() => setIsLogoutModelOpen(true)}
          >
            <LogOut className="h-6 w-6 flex-shrink-0 text-center" /> Log Out
          </div>
        </nav>
      </div>
      <LogoutModel
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        logout={logout}
      />
    </header>
  )
}

export default MobileHeader
