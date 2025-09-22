'use client'

import { Button } from '@/components/ui/button'
import { Archive, List } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const ArchiveToggle = () => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex items-center rounded-lg border border-gray-400">
      <Button
        onClick={() => router.push('/properties')}
        className={`h-11 px-3 ${pathname === '/properties' ? 'text-primary bg-white' : 'text-secondary bg-transparent'} hover:bg-secondary hover:text-white cursor-pointer`}
      >
        <List className="h-5 w-5 font-semibold" />
      </Button>
      <Button
        onClick={() => router.push('/properties/archived')}
        className={`h-11 px-3 ${pathname === '/properties/archived' ? 'text-primary bg-white' : 'text-secondary bg-transparent'} hover:bg-secondary hover:text-white cursor-pointer`}
      >
        <Archive className="h-5 w-5 font-semibold" />
      </Button>
    </div>
  )
}

export default ArchiveToggle
