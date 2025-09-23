"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortField, SortOrder } from "@/types/document.types"
import { ArrowUpDown } from "lucide-react"
import { useState } from "react"

interface SortButtonProps {
  onSortChange: (field: SortField, order: SortOrder) => void
}

const sortOptions: { label: string; field: SortField; order: SortOrder }[] = [
  { label: "Newest to Oldest", field: "dateAdded", order: "desc" },
  { label: "Oldest to Newest", field: "dateAdded", order: "asc" },
  { label: "A to Z", field: "name", order: "asc" },
  { label: "Z to A", field: "name", order: "desc" },
]

export function SortButton({ onSortChange }: SortButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<{ field: SortField; order: SortOrder } | null>(null)

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSelected({ field, order })
    onSortChange(field, order)
    setOpen(false)
  }

  const isSelected = (field: SortField, order: SortOrder) =>
    selected?.field === field && selected?.order === order

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex lg:h-11 h-13 cursor-pointer items-center space-x-1 font-semibold ${
            open ? "text-primary bg-white border-none" : "hover:bg-secondary hover:text-white"
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
         <span className="hidden lg:block">Sort</span> 
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {sortOptions.map(({ label, field, order }) => (
          <DropdownMenuItem
            key={label}
            onClick={() => handleSortChange(field, order)}
            className={`cursor-pointer font-semibold hover:bg-[#A2CFE33D] ${
              isSelected(field, order) ? "text-primary" : ""
            }`}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
