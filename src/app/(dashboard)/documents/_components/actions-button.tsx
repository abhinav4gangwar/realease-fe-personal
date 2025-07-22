'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export type actionType = 'select' | 'move' | 'download' | 'share' | 'delete'

interface ActionButtonProps {
  onActionSelect: (addType: actionType) => void
}

const actionOptions: { label: string; value: actionType }[] = [
  { label: 'Select', value: 'select' },
  { label: 'Move', value: 'move' },
  { label: 'Download', value: 'download' },
  { label: 'Share', value: 'share' },
  { label: 'Delete', value: 'delete' },
]

export function ActionsButton({ onActionSelect }: ActionButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<actionType | null>(null)

  const handleSelect = (value: actionType) => {
    setSelected(value)
    onActionSelect(value)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
        variant="outline"
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${
            open
              ? 'text-primary bg-white border-none'
              : 'bg-transparent text-scondary hover:bg-secondary hover:text-white'
          }`}
        >
          <span>Actions</span>
          {open ? (
            <ChevronUp className="text-primary h-6 w-4" />
          ) : (
            <ChevronDown className="h-6 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {actionOptions.map(({ label, value }) => (
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
