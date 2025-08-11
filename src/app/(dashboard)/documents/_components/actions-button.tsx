"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export type actionType = "select" | "move" | "download" | "share" | "delete"

interface ActionButtonProps {
  onActionSelect: (addType: actionType) => void
  isSelectMode?: boolean
  selectedCount?: number
}

const actionOptions: { label: string; value: actionType }[] = [
  { label: "Move", value: "move" },
  { label: "Download", value: "download" },
  { label: "Share", value: "share" },
  { label: "Delete", value: "delete" },
]

export function ActionsButton({ onActionSelect, isSelectMode = false, selectedCount = 0 }: ActionButtonProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<actionType | null>(null)

  const handleSelect = (value: actionType) => {
    if ( selectedCount === 0 ) {
      toast.error("Please select at least one document to perform this action")
      setOpen(false)
      return
    }
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
              { label: "Move", value: "move" as actionType },
              { label: "Download", value: "download" as actionType },
              { label: "Share", value: "share" as actionType },
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
          className={`flex h-11 cursor-pointer items-center space-x-1 font-semibold ${
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
            } ${ selectedCount === 0 ? "opacity-50" : ""}`}
            
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
