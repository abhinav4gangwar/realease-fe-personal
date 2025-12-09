'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Plus, Trash2, X } from 'lucide-react'
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
    <PlanAccessWrapper featureId="DOCUMENT_TAGGING_FILTERING">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <div
              className="border-input flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm"
              onClick={() => setIsOpen(true)}
            >
              {selectedTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-muted text-foreground flex items-center gap-1 rounded px-2 py-1 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagRemove(tag)
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <span className="text-muted-foreground text-sm">
                {selectedTags.length === 0 && placeholder}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-full border border-gray-300 p-0"
          align="start"
        >
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
              {filteredTags.length > 0 && (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="group flex items-center justify-between"
                    >
                      <Button
                        variant="ghost"
                        className="flex-1 cursor-pointer justify-start"
                        onClick={() => handleTagSelect(tag.name)}
                      >
                        {tag.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary h-8 w-8 cursor-pointer p-0 text-gray-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTag(tag.id, tag.name)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
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
            {shouldShowCreateOption && (
              <Button
                variant="ghost"
                className="hover:text-primary mb-1 w-full cursor-pointer justify-start text-gray-500"
                onClick={handleCreateTag}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Create New Tag "{searchValue}"
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </PlanAccessWrapper>
  )
}
