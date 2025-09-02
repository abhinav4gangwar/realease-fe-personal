"use client"

import { MobileNavigationItems } from "@/lib/constants"
import { Bell, CircleUser, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="z-40 bg-white px-6 py-4 shadow-sm lg:hidden block fixed w-full top-0">
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
        className={`fixed inset-0 z-50 bg-white text-black transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header of Menu */}
        <div className="flex items-center justify-between px-6 py-4 border-gray-700">
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
                className={`flex items-center gap-3 rounded-md py-3 px-4 text-lg font-medium transition-colors ${
                  isActive
                    ? " text-primary"
                    : "text-secondary hover:bg-gray-700"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default MobileHeader
