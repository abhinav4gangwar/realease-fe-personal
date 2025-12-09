'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
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

const filterOptions: { label: string; value: FilterType; premium?: boolean; featureIds?: string | string[] }[] = [
  { label: 'No Filter', value: 'none' },
  { label: 'By Property', value: 'property' },
  { label: 'By File Type', value: 'type' },
  { 
    label: 'By File Tags', 
    value: 'tags',
    premium: true,
    featureIds: 'SEARCH_FILTERING_CUSTOM_TAG'
  },
  { label: 'By Recently Uploaded', value: 'recent' },
]

export function FilterButton({ onFilterSelect }: FilterButtonProps) {
  const [open, setOpen] = useState(false)
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
          variant="ghost"
          className="hover:bg-primary/10 flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {filterOptions.map(({ label, value, premium, featureIds }) => {
          const menuItem = (
            <DropdownMenuItem
              key={value}
              onSelect={() => handleSelect(value)}
              className={`cursor-pointer font-semibold hover:bg-[#A2CFE33D] ${
                selected === value ? 'text-primary' : ''
              }`}
            >
              {label}
            </DropdownMenuItem>
          )

          return premium && featureIds ? (
            <PlanAccessWrapper
              key={value}
              featureId={featureIds}
              upgradeMessage="File Tags filtering is a premium feature. Upgrade to organize and filter your files by tags!"
              showCrown={true}
              crownPosition="top-right"
            >
              {menuItem}
            </PlanAccessWrapper>
          ) : (
            menuItem
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}