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

export type addType = 'createFolder' | 'uploadFile' | 'uploadFolder'

interface AddButtonProps {
  onAddSelect: (addType: addType) => void
}

const addOptions: { label: string; value: addType }[] = [
  { label: 'Create Folder', value: 'createFolder' },
  { label: 'Upload Docs', value: 'uploadFile' },
]

export function AddButton({ onAddSelect }: AddButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<addType | null>(null)

  const handleSelect = (value: addType) => {
    setSelected(value)
    onAddSelect(value)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${
            open
              ? 'text-primary bg-white'
              : 'bg-primary hover:bg-secondary text-white'
          }`}
        >
          <span>Add</span>
          {open ? (
            <ChevronUp className="text-primary h-6 w-4" />
          ) : (
            <ChevronDown className="h-6 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {addOptions.map(({ label, value }) => (
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
