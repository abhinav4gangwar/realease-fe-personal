"use clientr"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface PropertySectionProps {
  title: string
  enabled: boolean
  onToggle: (value: boolean) => void
  ownerEnabled: boolean
  onOwnerToggle: (value: boolean) => void
  locationEnabled: boolean
  onLocationToggle: (value: boolean) => void
  ownerTags: string[]
  onOwnerTagsChange: (tags: string[]) => void
  locationTags: string[]
  onLocationTagsChange: (tags: string[]) => void
}

export const PropertySection = ({
  title,
  enabled,
  onToggle,
  ownerEnabled,
  onOwnerToggle,
  locationEnabled,
  onLocationToggle,
  ownerTags,
  onOwnerTagsChange,
  locationTags,
  onLocationTagsChange
}: PropertySectionProps) => {
  const [ownerInput, setOwnerInput] = useState('')
  const [locationInput, setLocationInput] = useState('')

  const handleAddTag = (type: 'owner' | 'location', value: string) => {
    if (!value.trim()) return
    if (type === 'owner') {
      onOwnerTagsChange([...ownerTags, value.trim()])
      setOwnerInput('')
    } else {
      onLocationTagsChange([...locationTags, value.trim()])
      setLocationInput('')
    }
  }

  const handleRemoveTag = (type: 'owner' | 'location', index: number) => {
    if (type === 'owner') {
      onOwnerTagsChange(ownerTags.filter((_, i) => i !== index))
    } else {
      onLocationTagsChange(locationTags.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1>{title}</h1>
        <Switch checked={enabled} onCheckedChange={onToggle} className="cursor-pointer" />
      </div>

      {enabled && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  className="h-4 w-4 accent-[#f16969]"
                  checked={ownerEnabled}
                  onChange={(e) => onOwnerToggle(e.target.checked)}
                />
                <span>Owner</span>
              </label>

              {ownerEnabled && (
                <div className="mt-3 flex flex-col gap-3">
                  <Input
                    placeholder="Type owner and press Enter"
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag('owner', ownerInput)
                      }
                    }}
                    className="h-9 rounded-full"
                  />
                </div>
              )}
            </div>

            {ownerEnabled && (
              <div className="flex flex-wrap gap-2 pt-4">
                {ownerTags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                  >
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag('owner', i)} className="text-[#f16969]">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  className="h-4 w-4 accent-[#f16969]"
                  checked={locationEnabled}
                  onChange={(e) => onLocationToggle(e.target.checked)}
                />
                <span>Location</span>
              </label>

              {locationEnabled && (
                <div className="mt-3 flex flex-col gap-3">
                  <Input
                    placeholder="Type location and press Enter"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag('location', locationInput)
                      }
                    }}
                    className="h-9 rounded-full"
                  />
                </div>
              )}
            </div>

            {locationEnabled && (
              <div className="flex flex-wrap gap-2 pt-4">
                {locationTags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                  >
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag('location', i)} className="text-[#f16969]">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
