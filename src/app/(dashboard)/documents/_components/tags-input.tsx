'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Tag, tagsApi } from '../doc_utils/tags.services'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Select tags...',
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const selectedTags = value
    ? value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const tags = await tagsApi.getTags()
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      !selectedTags.includes(tag.name)
  )

  const shouldShowCreateOption =
    searchValue.trim() &&
    !allTags.some(
      (tag) => tag.name.toLowerCase() === searchValue.toLowerCase()
    ) &&
    !selectedTags.includes(searchValue.trim())

  const handleTagSelect = (tagName: string) => {
    const newTags = [...selectedTags, tagName]
    onChange(newTags.join(', '))
    setSearchValue('')
    setIsOpen(false)
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove)
    onChange(newTags.join(', '))
  }

  const handleCreateTag = async () => {
    if (!searchValue.trim()) return

    setIsLoading(true)
    try {
      const updatedTags = await tagsApi.createTag(searchValue.trim())
      setAllTags(updatedTags)
      handleTagSelect(searchValue.trim())
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    try {
      const updatedTags = await tagsApi.deleteTag(tagId)
      setAllTags(updatedTags)
      if (selectedTags.includes(tagName)) {
        handleTagRemove(tagName)
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            value={selectedTags.join(', ')}
            placeholder={placeholder}
            readOnly
            className="cursor-pointer bg-transparent h-11"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full border-gray-400 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or type new tag..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                e.preventDefault()
                if (shouldShowCreateOption) {
                  handleCreateTag()
                } else {
                  const exactMatch = filteredTags.find(
                    (tag) =>
                      tag.name.toLowerCase() === searchValue.toLowerCase()
                  )
                  if (exactMatch) {
                    handleTagSelect(exactMatch.name)
                  }
                }
              }
            }}
            className="mb-2 h-11"
          />

          <div className="max-h-48 overflow-auto">
            {shouldShowCreateOption && (
              <Button
                variant="ghost"
                className="text-primary mb-1 w-full justify-start"
                onClick={handleCreateTag}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create "{searchValue}"
              </Button>
            )}

            {filteredTags.length > 0 && (
              <div className="space-y-1">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center justify-between"
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start"
                      onClick={() => handleTagSelect(tag.name)}
                    >
                      {tag.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTag(tag.id, tag.name)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {filteredTags.length === 0 && !shouldShowCreateOption && (
              <div className="text-muted-foreground p-2 text-center text-sm">
                No tags found. Type to create a new one.
              </div>
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <div className="text-muted-foreground mb-2 text-xs">
                Selected tags:
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                  >
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0"
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
