"use client"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FileItem } from "@/lib/fileUploadUtils"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { useState } from "react"
import { FileIcon } from "./file-icon"

interface FileDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentViewItems: FileItem[]
  folderPath: string[]
  handleBackClick: () => void
  handleFolderClick: (folder: FileItem) => void
  updateFileMetadata: (path: string, field: "propertyId" | "tags", value: string) => void
  handleSave: () => void
  isLoading: boolean
}

const properties = [{ id: "0", name: "Test Property" }]

const predefinedTags = [
  "Document",
  "Image",
  "Important",
  "Archive",
  "Draft",
  "Review",
  "Personal",
  "Work",
  "Project",
  "Reference",
]

const getFileType = (fileName: string, isDirectory: boolean) => {
  if (isDirectory) return "folder"
  return fileName.split(".").pop()?.toLowerCase() ?? "file"
}

export function FileDetailsDialog({
  isOpen,
  onOpenChange,
  currentViewItems,
  folderPath,
  handleBackClick,
  handleFolderClick,
  updateFileMetadata,
  handleSave,
  isLoading,
}: FileDetailsDialogProps) {
  const [openComboBoxes, setOpenComboBoxes] = useState<Record<string, boolean>>({})
  const [searchValues, setSearchValues] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleClose = () => onOpenChange(false)

  const toggleComboBox = (itemPath: string) => {
    setOpenComboBoxes((prev) => ({
      ...prev,
      [itemPath]: !prev[itemPath],
    }))
    // Reset search value when closing
    if (openComboBoxes[itemPath]) {
      setSearchValues((prev) => ({
        ...prev,
        [itemPath]: "",
      }))
    }
  }

  const handleTagSelect = (itemPath: string, tag: string) => {
    updateFileMetadata(itemPath, "tags", tag)
    setOpenComboBoxes((prev) => ({
      ...prev,
      [itemPath]: false,
    }))
    setSearchValues((prev) => ({
      ...prev,
      [itemPath]: "",
    }))
  }

  const handleSearchChange = (itemPath: string, value: string) => {
    setSearchValues((prev) => ({
      ...prev,
      [itemPath]: value,
    }))
  }

  const getFilteredTags = (searchValue: string) => {
    if (!searchValue) return predefinedTags
    return predefinedTags.filter((tag) => tag.toLowerCase().includes(searchValue.toLowerCase()))
  }

  const shouldShowCreateOption = (searchValue: string) => {
    if (!searchValue.trim()) return false
    return !predefinedTags.some((tag) => tag.toLowerCase() === searchValue.toLowerCase())
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background mx-4 flex max-h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-gray-400 shadow-lg">
          <div className="flex items-center justify-between p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {folderPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              Edit Details{" "}
              {folderPath.length > 0 && (
                <span className="text-muted-foreground text-sm">/ {folderPath.join(" / ")}</span>
              )}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:text-primary h-8 w-8 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2 p-4">
            <div className="max-h-[400px] overflow-auto rounded-md border border-gray-500 p-4">
              <div className="bg-background sticky -top-4 grid grid-cols-3 gap-4 px-2 py-5 font-medium">
                <div>Name</div>
                <div>Linked Property</div>
                <div>Tag</div>
              </div>
              <div className="mt-1 space-y-1">
                {currentViewItems.map((item) => {
                  const searchValue = searchValues[item.path] || ""
                  const filteredTags = getFilteredTags(searchValue)
                  const showCreateOption = shouldShowCreateOption(searchValue)

                  return (
                    <div key={item.path} className="grid grid-cols-3 items-center gap-4 p-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon type={getFileType(item.name, item.isDirectory)} />
                        {item.isDirectory ? (
                          <button
                            className="truncate text-left hover:text-primary"
                            onClick={() => handleFolderClick(item)}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      {!item.isDirectory ? (
                        <>
                          <Select
                            value={item.propertyId || "0"}
                            onValueChange={(v) => updateFileMetadata(item.path, "propertyId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Popover
                            open={openComboBoxes[item.path] || false}
                            onOpenChange={() => toggleComboBox(item.path)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openComboBoxes[item.path] || false}
                                className="w-full justify-between bg-transparent"
                              >
                                {item.tags || "Select tag..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 border-gray-400" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search or type new tag..."
                                  value={searchValue}
                                  onValueChange={(value) => handleSearchChange(item.path, value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchValue.trim()) {
                                      e.preventDefault()
                                      handleTagSelect(item.path, searchValue.trim())
                                    }
                                  }}
                                />
                                <CommandList>
                                  {filteredTags.length === 0 && !showCreateOption && (
                                    <CommandEmpty className="p-2">
                                      <div className="text-sm text-muted-foreground">
                                        No tags found. Type to create a new one.
                                      </div>
                                    </CommandEmpty>
                                  )}

                                  {showCreateOption && (
                                    <CommandGroup>
                                      <CommandItem
                                        value={`create-${searchValue}`}
                                        onSelect={() => handleTagSelect(item.path, searchValue.trim())}
                                        className="text-primary"
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create &quot;{searchValue}&quot;
                                      </CommandItem>
                                    </CommandGroup>
                                  )}

                                  {filteredTags.length > 0 && (
                                    <CommandGroup>
                                      {filteredTags.map((tag) => (
                                        <CommandItem
                                          key={tag}
                                          value={tag}
                                          onSelect={() => handleTagSelect(item.path, tag)}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              item.tags === tag ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {tag}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  )}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </>
                      ) : (
                        <>
                          <div />
                          <div />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
              >
                {isLoading ? "Uploading..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
