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

export function MobileDocsFilterModal({ isOpen, onClose, filterType, documents, selectedItems, onApply }: FilterModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedItems)

  if (!documents) return null

  const getUniqueItems = () => {
    if (filterType === "property") {
      return [...new Set(documents.map((doc) => doc.linkedProperty).filter(Boolean))]
    } else {
      const friendlyTypes = documents.map((doc) => {
        if (doc.isFolder) return "Folder"

        const friendlyType = getFileTypeFromMime(doc.fileType, doc.name)
        return friendlyType
      }).filter(Boolean) // Filter out undefined/null values

      return [...new Set(friendlyTypes)].sort()
    }
  }

  const filteredItems = getUniqueItems().filter((item) =>
    item && typeof item === 'string' && item.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const title = filterType === "property" ? "Filter By Property" : "Filter By File Type"

  return (
    <div className={`${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col rounded-t-xl bg-white shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-12 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
          </div>

          {/* Filter Items - Single Column for Mobile */}
          <div className="space-y-3 pb-4">
            {filteredItems.map((item) => {
              const isSelected = tempSelected.includes(item)
              return (
                <div key={item} className="flex items-center space-x-3">
                  <Checkbox
                    id={item}
                    checked={isSelected}
                    onCheckedChange={() => handleItemToggle(item)}
                    className={`${
                      isSelected
                        ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        : "border-gray-300"
                    }`}
                  />
                  <label
                    htmlFor={item}
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

        {/* Bottom Action Button */}
        <div className="border-t border-gray-200 p-6">
          <Button 
            onClick={handleApply} 
            className="w-full bg-primary hover:bg-secondary h-12 text-base font-medium"
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  )
}