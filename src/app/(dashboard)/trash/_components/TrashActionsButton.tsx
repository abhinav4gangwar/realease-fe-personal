"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export type actionType = "restore" | "delete" | "select"

interface ActionButtonProps {
  onActionSelect: (addType: actionType) => void
  isSelectMode?: boolean
  selectedCount?: number
}

const actionOptions: { label: string; value: actionType }[] = [
  { label: "Restore", value: "restore" },
  { label: "Delete", value: "delete" },
]

export function TrashActionsButton({ onActionSelect, isSelectMode = false, selectedCount = 0 }: ActionButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<actionType | null>(null)

  const handleSelect = (value: actionType) => {
    setSelected(value)
    onActionSelect(value)
    setOpen(false)
  }

  const getButtonText = () => {
    if (isSelectMode) {
      return "Deselect"
    }
    return "Actions"
  }

  const getActionOptions = () => {
    if (isSelectMode) {
      return [
        { label: "Deselect", value: "select" as actionType },
        ...(selectedCount > 0
          ? [
              { label: "Restore", value: "restore" as actionType },
              { label: "Delete", value: "delete" as actionType },
            ]
          : []),
      ]
    }
    return actionOptions
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold bg-primary${
            open
              ? "text-primary bg-white border-none"
              : "bg-transparent text-scondary hover:bg-secondary hover:text-white"
          }`}
        >
          <span>{getButtonText()}</span>
          {open ? <ChevronUp className="text-primary h-6 w-4" /> : <ChevronDown className="h-6 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-none">
        {getActionOptions().map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleSelect(value)}
            className={`cursor-pointer font-semibold hover:bg-[#A2CFE33D] ${
              selected === value ? "text-primary" : ""
            } ${value !== "select" && isSelectMode && selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={value !== "select" && isSelectMode && selectedCount === 0}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
