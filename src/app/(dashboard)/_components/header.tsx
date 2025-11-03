'use client'

import NotificationButton from '@/components/notification-compoents/notification-button'
import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import DocumentSearch from '@/components/searchbars/document-search'
import GlobalSearch from '@/components/searchbars/global-search'
import PropertySearch from '@/components/searchbars/property-search'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useGlobalContextProvider } from '@/providers/global-context'
import { useLogout } from '@/utils/logout'
import { CircleUser } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import LogoutModel from './logout-modal'

export function Header() {
  const [open, setOpen] = useState<boolean>(false)
  const logout = useLogout()
  const pathname = usePathname()
  const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false)
  const router = useRouter()
  const { accountDetails, userType } = useGlobalContextProvider()
  return (
    <header className="z-40 hidden bg-white px-6 py-4 shadow-sm lg:block">
      <div className="flex items-center justify-between">
        <PlanAccessWrapper
          featureId="SEARCH_KEYWORD"
          className="w-full"
          crownPosition="top-left"
        >
          <div className="hidden w-full lg:block">
            {pathname === '/properties' ? (
              <PropertySearch />
            ) : pathname === '/documents' ? (
              <DocumentSearch />
            ) : (
              <GlobalSearch />
            )}
          </div>
        </PlanAccessWrapper>

        {/* Search Bar */}

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
          <NotificationButton />

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="text-secondary hover:text-primary h-0 w-0 cursor-pointer bg-transparent hover:bg-transparent">
                <CircleUser className="size-8" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="flex w-2xs flex-col space-y-2 border-none"
            >
              <DropdownMenuItem className="flex items-center gap-4">
                <CircleUser className="size-10" />
                <div className="flex flex-col">
                  {accountDetails && (
                    <h1>{accountDetails.name || 'Not Provided'}</h1>
                  )}
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="hover:text-secondary cursor-pointer hover:bg-gray-300"
                onClick={() => router.push('/settings/account-details')}
              >
                <h1>User Profile Settings</h1>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="hover:text-secondary cursor-pointer hover:bg-gray-300"
                onClick={() => setIsLogoutModelOpen(true)}
              >
                <h1>Logout</h1>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LogoutModel
        isOpen={isLogoutModelOpen}
        onClose={() => setIsLogoutModelOpen(false)}
        logout={logout}
      />
    </header>
  )
}
