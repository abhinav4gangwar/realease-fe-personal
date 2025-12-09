'use client'
import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Input } from '@/components/ui/input'
import { SettingsnavigationItems } from '@/lib/constants'
import { Layers, SquareUser, UserX } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const SettingsSidebar = () => {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSearchQuery('')
  }, [pathname])

  const subMenuItems = [
    {
      icon: SquareUser,
      label: 'Personal Details',
      href: '/settings/account-details',
    },
    {
      icon: Layers,
      label: 'Subscription',
      href: '/settings/account-details/subscription',
    },
    {
      icon: UserX,
      label: 'Delete Account',
      href: '/settings/account-details/delete-account',
    },
  ]

  // Configuration object for premium features (main items and subitems)
  const premiumFeatures: Record<
    string,
    {
      featureIds: string | string[]
      upgradeMessage?: string
    }
  > = {
    '/settings/activity-log': {
      featureIds: 'PERM_AUDIT_VIEW',
    },
    '/settings/access-control': {
      featureIds: ['PERM_USER_VIEW', 'PERMISSIONS_ADVANCED'],
    },
    '/settings/account-details/subscription': {
      featureIds: 'PLAN_COMPANY_PREMIUM',
    },
    
  }

  const requiresPremiumAccess = (href: string) => {
    return href in premiumFeatures
  }

  const getFeatureConfig = (href: string) => {
    return (
      premiumFeatures[href] || { featureIds: '', upgradeMessage: undefined }
    )
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return SettingsnavigationItems
    }

    const query = searchQuery.toLowerCase()

    return SettingsnavigationItems.filter((item) => {
      const labelMatch = item.label.toLowerCase().includes(query)

      if (item.href === '/settings/account-details') {
        const subItemMatch = subMenuItems.some((subItem) =>
          subItem.label.toLowerCase().includes(query)
        )
        return labelMatch || subItemMatch
      }

      return labelMatch
    })
  }, [searchQuery])

  const filteredSubItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return subMenuItems
    }

    const query = searchQuery.toLowerCase()
    return subMenuItems.filter((subItem) =>
      subItem.label.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const shouldShowSubMenu = (item) => {
    if (item.href !== '/settings/account-details') return false

    const isActive = pathname === item.href || pathname.startsWith(item.href)

    if (searchQuery.trim()) {
      return filteredSubItems.length > 0
    }

    return isActive
  }

  return (
    <div className="text-secondary no-scrollbar flex h-full w-2xs flex-col space-y-6 overflow-y-auto bg-white p-4 shadow-lg">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <Input
          className="h-9 rounded-full"
          placeholder="Search Settings"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 space-y-4">
        {filteredItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No settings found matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          filteredItems.map((item, index) => {
            const isActive = pathname === item.href
            const needsPremium = requiresPremiumAccess(item.href)

            const linkElement = (
              <Link
                href={item.href}
                className={`flex items-center rounded-md p-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E6F7FF] font-medium'
                    : 'hover:bg-[#E6F7FF] hover:font-medium'
                }`}
              >
                <item.icon />
                <span className="ml-2">{item.label}</span>
              </Link>
            )

            return (
              <div key={index}>
                {needsPremium ? (
                  <PlanAccessWrapper
                    featureId={getFeatureConfig(item.href).featureIds}
                    upgradeMessage={getFeatureConfig(item.href).upgradeMessage}
                  >
                    {linkElement}
                  </PlanAccessWrapper>
                ) : (
                  linkElement
                )}
                {shouldShowSubMenu(item) && (
                  <div className="mt-2 ml-6 flex flex-col space-y-3 border-l border-gray-200 pl-3">
                    {filteredSubItems.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.href
                      const subNeedsPremium = requiresPremiumAccess(subItem.href)

                      const subLinkElement = (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className={`flex gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                            isSubActive
                              ? 'text-secondary bg-[#F8F8F8] shadow-md'
                              : 'hover:text-secondary text-gray-400 hover:bg-[#F8F8F8] hover:shadow-md'
                          }`}
                        >
                          <subItem.icon className="size-5" />
                          {subItem.label}
                        </Link>
                      )

                      return subNeedsPremium ? (
                        <PlanAccessWrapper
                          key={subIndex}
                          featureId={getFeatureConfig(subItem.href).featureIds}
                        >
                          {subLinkElement}
                        </PlanAccessWrapper>
                      ) : (
                        subLinkElement
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SettingsSidebar