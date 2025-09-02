'use client'

import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export function PropertiesFilterButton({onFilterSelect}:any) {
  return (
    <Button
      variant="outline"
      onClick={onFilterSelect}
      className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${'hover:bg-secondary hover:text-white'}`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className='hidden lg:block'>Filter</span>
    </Button>
  )
}
