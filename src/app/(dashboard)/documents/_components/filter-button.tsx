'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FilterType } from '@/types/document.types'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface FilterButtonProps {
  onFilterSelect: (filterType: FilterType) => void
}

const filterOptions: { label: string; value: FilterType }[] = [
  { label: 'No Filter', value: 'none' },
  { label: 'By Property', value: 'property' },
  { label: 'By File Type', value: 'type' },
  { label: 'By File Tags', value: 'tags' },
  { label: 'By Recently Uploaded', value: 'recent' },
]

export function FilterButton({ onFilterSelect }: FilterButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<FilterType | null>(null)

  const handleSelect = (value: FilterType) => {
    setSelected(value)
    onFilterSelect(value)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex h-13 cursor-pointer items-center space-x-1 font-semibold lg:h-11 ${
            open
              ? 'text-primary border-none bg-white'
              : 'hover:bg-secondary hover:text-white'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden lg:block">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {filterOptions.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleSelect(value)}
            className={`cursor-pointer font-semibold hover:bg-[#A2CFE33D] ${
              selected === value ? 'text-primary' : ''
            }`}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
