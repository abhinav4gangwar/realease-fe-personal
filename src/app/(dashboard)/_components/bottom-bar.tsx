'use client'
import { MobileNavigationItems } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Bottombar = () => {
  const pathname = usePathname()
  return (
    <div className="bg-secondary fixed bottom-0 flex justify-between w-full text-white lg:hidden py-4">
      {MobileNavigationItems.map((item, index) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center rounded-md py-2 px-3.5 text-xs font-medium transition-colors ${
              isActive
                ? 'text-primary'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-6 w-6 flex-shrink-0 text-center" />
            <p className="pt-1">{item.label}</p>
          </Link>
        )
      })}
    </div>
  )
}

export default Bottombar
