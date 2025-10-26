'use client'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { navigationItems, navigationItemSection } from '@/lib/constants'
import { useLogout } from '@/utils/logout'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import LogoutModel from './logout-modal'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false)
  const pathname = usePathname()
  const logout = useLogout()
  return (
    <div
      className={`bg-secondary text-white transition-all duration-300 ${
        collapsed ? 'w-18' : 'w-56'
      } hidden flex-col lg:flex`}
    >
      {/* Logo and Toggle */}
      <div className="flex flex-col items-center gap-5 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="bg-[#ececec86]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Image
              src="/assets/logo-white.png"
              alt="logo"
              width={140}
              height={40}
            />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center space-x-2 p-2">
            <Image
              src="/assets/logo-short.png"
              alt="logo"
              width={40}
              height={40}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <TooltipProvider delayDuration={300}>
        <nav className="flex-1 space-y-4 px-2 py-4">
          {navigationItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            const linkContent = (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                prefetch
              >
                <item.icon className="ml-0.5 h-6 w-6 flex-shrink-0 text-center" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            )

            return collapsed ? (
              <Tooltip key={index}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="text-secondary font-semibold max-w-sm border border-gray-400 bg-white shadow-lg">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              linkContent
            )
          })}

          <div className="flex justify-center">
            <div className="mx-1.5 h-[2px] w-full bg-[#4F4F4F]"></div>
          </div>

          {navigationItemSection.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            const linkContent = (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                prefetch
              >
                <item.icon className="h-6 w-6 flex-shrink-0 text-center" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            )

            return collapsed ? (
              <Tooltip key={index}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="text-secondary font-semibold max-w-sm border border-gray-400 bg-white shadow-lg">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              linkContent
            )
          })}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsLogoutModelOpen(true)}
                >
                  <LogOut className="h-6 w-6 flex-shrink-0 text-center" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-secondary font-semibold max-w-sm border border-gray-400 bg-white shadow-lg">
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div
              className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              onClick={() => setIsLogoutModelOpen(true)}
            >
              <LogOut className="h-6 w-6 flex-shrink-0 text-center" />
              <span className="ml-3">Log Out</span>
            </div>
          )}
        </nav>
      </TooltipProvider>
      <LogoutModel
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        logout={logout}
      />
    </div>
  )
}