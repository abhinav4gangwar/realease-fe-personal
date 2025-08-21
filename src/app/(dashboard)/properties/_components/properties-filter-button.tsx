'use client'

import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export function PropertiesFilterButton() {
  return (
    <Button
      variant="outline"
      className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${'hover:bg-secondary hover:text-white'}`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filter
    </Button>
  )
}
