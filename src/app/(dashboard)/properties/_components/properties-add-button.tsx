'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function PropertiesAddButton({ onAddSelect }: any) {
  return (
    <Button
      className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${'bg-primary hover:bg-secondary text-white'}`}
      onClick={onAddSelect}
    >
      Add
      <Plus className="h-6 w-6" />
    </Button>
  )
}
