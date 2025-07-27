"use client"


import { Button } from "@/components/ui/button"
import { BreadcrumbItem } from "@/types/document.types"
import { ChevronRight } from "lucide-react"

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
}

export function BreadcrumbNavigation({ items, onNavigate }: BreadcrumbNavigationProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900"
            onClick={() => onNavigate(index)}
          >
            {item.name}
          </Button>
          {index < items.length - 1 && <ChevronRight className="w-4 h-4" />}
        </div>
      ))}
    </div>
  )
}
