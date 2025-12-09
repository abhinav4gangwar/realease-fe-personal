'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { PropertySortField, PropertySortOrder } from '@/types/property.types'
import { ArrowUpDown } from 'lucide-react'
import { useState } from 'react'

interface SortButtonProps {
  onSortChange: (field: PropertySortField, order: PropertySortOrder) => void
}

const sortOptions: {
  label: string
  field: PropertySortField
  order: PropertySortOrder
}[] = [
  { label: 'Owner (A-Z)', field: 'owner', order: 'asc' },
  { label: 'Owner (Z-A)', field: 'owner', order: 'desc' },
  { label: 'Value High-Low', field: 'value', order: 'desc' },
  { label: 'Value Low-High', field: 'value', order: 'asc' },
  { label: 'Newest to Oldest', field: 'dateAdded', order: 'desc' },
  { label: 'Oldest to Newest', field: 'dateAdded', order: 'asc' },
  { label: 'A to Z', field: 'name', order: 'asc' },
  { label: 'Z to A', field: 'name', order: 'desc' },
]

export function PropertiesSortButton({ onSortChange }: SortButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<{
    field: PropertySortField
    order: PropertySortOrder
  } | null>(null)

  const handleSortChange = (
    field: PropertySortField,
    order: PropertySortOrder
  ) => {
    setSelected({ field, order })
    onSortChange(field, order)
    setOpen(false)
  }

  const isSelected = (field: PropertySortField, order: PropertySortOrder) =>
    selected?.field === field && selected?.order === order

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${
            open
              ? 'text-primary border-none bg-white'
              : 'hover:bg-secondary hover:text-white'
          }`}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden lg:block">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {sortOptions.map(({ label, field, order }) => (
          <DropdownMenuItem
            key={label}
            onClick={() => handleSortChange(field, order)}
            className={`cursor-pointer font-semibold hover:bg-[#A2CFE33D] ${
              isSelected(field, order) ? 'text-primary' : ''
            }`}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
