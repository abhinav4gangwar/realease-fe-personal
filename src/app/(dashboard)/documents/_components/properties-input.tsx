'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Properties } from '@/types/property.types'

import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { propertiesApi } from '../../properties/_property_utils/property.services'


interface PropertyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PropertyInput({
  value,
  onChange,
  placeholder = 'Select property...',
}: PropertyInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [allProperties, setAllProperties] = useState<Properties[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const selectedProperty = allProperties.find(property => property.id === value)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    setIsLoading(true)
    try {
      const properties = await propertiesApi.getProperties()
      setAllProperties(properties)
    } catch (error) {
      console.error('Failed to load properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProperties = allProperties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      property.location.toLowerCase().includes(searchValue.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handlePropertySelect = (propertyId: string) => {
    onChange(propertyId)
    setSearchValue('')
    setIsOpen(false)
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <div
            className="border-input flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-accent/50"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedProperty ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate">{selectedProperty.name}</span>
                  <span className="text-muted-foreground text-xs truncate">
                    {selectedProperty.location}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedProperty && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-3xl border border-gray-300 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search properties..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredProperties.length === 1) {
                e.preventDefault()
                handlePropertySelect(filteredProperties[0].id!)
              }
            }}
            className="mb-2 h-11"
          />

          <div className="max-h-48 overflow-auto">
            {isLoading ? (
              <div className="text-muted-foreground p-2 text-center text-sm">
                Loading properties...
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="space-y-1">
                {filteredProperties.map((property) => (
                  <Button
                    key={property.id}
                    variant="ghost"
                    className="w-full justify-start cursor-pointer p-2 h-auto"
                    onClick={() => handlePropertySelect(property.id!)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-medium">{property.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {property.location}
                        {property.address && ` • ${property.address}`}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground p-2 text-center text-sm">
                No properties found matching your search.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}