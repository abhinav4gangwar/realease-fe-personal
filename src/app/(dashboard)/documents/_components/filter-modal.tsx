"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Document } from "@/types/document.types"
import { getFileTypeFromMime } from "@/utils/fileTypeUtils"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filterType: "property" | "type"
  documents: Document[]
  selectedItems: string[]
  onApply: (selectedItems: string[]) => void
}

export function FilterModal({ isOpen, onClose, filterType, documents, selectedItems, onApply }: FilterModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedItems)

  if (!isOpen) return null

  const getUniqueItems = () => {
    if (filterType === "property") {
      return [...new Set(documents.map((doc) => doc.linkedProperty))]
    } else {
      const friendlyTypes = documents.map((doc) => {
        if (doc.isFolder) return "Folder"
      
        const friendlyType = getFileTypeFromMime(doc.fileType, doc.name)
        return friendlyType
      })
      
      return [...new Set(friendlyTypes)].sort()
    }
  }

  const filteredItems = getUniqueItems().filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleItemToggle = (item: string) => {
    setTempSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const handleClearAll = () => {
    setTempSelected([])
  }

  const handleApply = () => {
    onApply(tempSelected)
    onClose()
  }

  const title = filterType === "property" ? "Filter By Property" : "Filter By Type"

  // Split items into two columns
  const midPoint = Math.ceil(filteredItems.length / 2)
  const leftColumn = filteredItems.slice(0, midPoint)
  const rightColumn = filteredItems.slice(midPoint)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 w-full max-w-2xl max-h-[80vh] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search and Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search in Filters"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button variant="outline" onClick={handleClearAll} className="h-11">
              Clear All
            </Button>
            <Button onClick={handleApply} className="bg-primary hover:bg-secondary h-11">
              Apply
            </Button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto py-3">
            {/* Left Column */}
            <div className="space-y-3">
              {leftColumn.map((item) => {
                const isSelected = tempSelected.includes(item)
                return (
                  <div key={item} className="flex items-center space-x-3">
                    <Checkbox
                      id={`left-${item}`}
                      checked={isSelected}
                      onCheckedChange={() => handleItemToggle(item)}
                      className={`${
                        isSelected
                          ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          : "border-gray-300"
                      }`}
                    />
                    <label
                      htmlFor={`left-${item}`}
                      className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                        isSelected ? "text-primary font-medium" : "text-gray-500"
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                )
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {rightColumn.map((item) => {
                const isSelected = tempSelected.includes(item)
                return (
                  <div key={item} className="flex items-center space-x-3">
                    <Checkbox
                      id={`right-${item}`}
                      checked={isSelected}
                      onCheckedChange={() => handleItemToggle(item)}
                      className={`${
                        isSelected
                          ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          : "border-gray-300"
                      }`}
                    />
                    <label
                      htmlFor={`right-${item}`}
                      className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                        isSelected ? "text-primary font-medium" : "text-gray-500"
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}