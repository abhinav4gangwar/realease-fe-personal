'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import DocumentSearch from '@/components/searchbars/document-search'
import GlobalSearch from '@/components/searchbars/global-search'
import PropertySearch from '@/components/searchbars/property-search'
import { Bell, CircleUser } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  return (
    <header className="z-40 hidden bg-white px-6 py-4 shadow-sm lg:block">
      <div className="flex items-center justify-between">
        
          <div className="hidden w-full lg:block">
            {pathname === '/properties' ? (
           <PlanAccessWrapper featureId="search_keyword" className='w-full' crownPosition='top-left'><PropertySearch /></PlanAccessWrapper>   
            ) : pathname === '/documents' ? (
            <PlanAccessWrapper featureId="search_keyword" className='w-full' crownPosition='top-left'><DocumentSearch /></PlanAccessWrapper>  
            ) : (
            <PlanAccessWrapper featureId='search_advanced' className='w-full' crownPosition='top-left'><GlobalSearch /></PlanAccessWrapper>  
            )}
          </div>

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
          <Bell className="h-7 w-7" />
          <CircleUser className="h-8 w-8" />
        </div>
      </div>
    </header>
  )
}
