'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'

const StandAloneForm = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [numAssets, setNumAssets] = useState<number | null>(null)

  // Checkboxes
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Location filters
  const [locationType, setLocationType] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState('')

  // Property type
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])

  // Litigation
  const [litigation, setLitigation] = useState<string | null>(null)

  // Owner + Tag
  const [owners, setOwners] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [ownerInput, setOwnerInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  const handleAddItem = (type: string) => {
    if (type === 'location' && locationInput.trim()) {
      setLocations([...locations, locationInput.trim()])
      setLocationInput('')
    }
    if (type === 'owner' && ownerInput.trim()) {
      setOwners([...owners, ownerInput.trim()])
      setOwnerInput('')
    }
    if (type === 'tag' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveItem = (type: string, value: string) => {
    if (type === 'location') setLocations(locations.filter((i) => i !== value))
    if (type === 'owner') setOwners(owners.filter((i) => i !== value))
    if (type === 'tag') setTags(tags.filter((i) => i !== value))
  }

  const handleGenerate = () => {
    const formData = {
      numAssets,
      selectedFilters,
      locationType,
      locations,
      propertyTypes,
      litigation,
      owners,
      tags,
    }

    console.log('Form Data:', JSON.stringify(formData, null, 2))
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[600px] flex-col border-l bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-xl font-semibold">Add Standalone Stat</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Number of Assets */}
              <div className="flex items-center gap-2">
                <Label className="text-lg">I want to see</Label>
                <select
                  className="mt-2 rounded border border-gray-400 p-2"
                  value={numAssets ?? ''}
                  onChange={(e) => setNumAssets(Number(e.target.value))}
                >
                  <option value="">Number</option>
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Label className="text-lg">of assets considering:</Label>
              </div>

              {/* Main checkboxes */}
              <div className="space-y-5">
                {[
                  'Location',
                  'Property Type',
                  'Litigation Status',
                  'Owner',
                  'Tag',
                ].map((filter) => (
                  <div key={filter} className="space-y-3">
                    {/* Parent filter checkbox */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFilters.includes(filter)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFilters([...selectedFilters, filter])
                          } else {
                            setSelectedFilters(
                              selectedFilters.filter((f) => f !== filter)
                            )
                          }
                        }}
                      />
                      <Label className="text-[16px]">{filter}</Label>
                    </div>

                    {/* Conditional fields under the parent */}
                    {filter === 'Location' &&
                      selectedFilters.includes('Location') && (
                        <div className="p-6">
                          <RadioGroup
                            value={locationType ?? ''}
                            onValueChange={(val) => setLocationType(val)}
                            className="flex gap-10"
                          >
                            {[
                              'Localities',
                              'Cities',
                              'States',
                              'Countries',
                            ].map((opt) => (
                              <div
                                key={opt}
                                className="flex items-center gap-3"
                              >
                                <RadioGroupItem value={opt} id={opt} />
                                <Label htmlFor={opt} className="text-[16px]">
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          {locationType && (
                            <div className="mt-8">
                              <Input
                                placeholder={`Type here to enter the selections of ${locationType}`}
                                value={locationInput}
                                onChange={(e) =>
                                  setLocationInput(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && handleAddItem('location')
                                }
                                className="h-10 w-[70%] rounded-full"
                              />
                              <div className="mt-2 flex flex-wrap gap-2">
                                {locations.map((loc) => (
                                  <span
                                    key={loc}
                                    className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                                  >
                                    {loc}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() =>
                                        handleRemoveItem('location', loc)
                                      }
                                    />
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {filter === 'Property Type' &&
                      selectedFilters.includes('Property Type') && (
                        <div className="space-y-5 p-6">
                          {['Residential', 'Commercial', 'Land', 'Plot'].map(
                            (type) => (
                              <div
                                key={type}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={propertyTypes.includes(type)}
                                  onCheckedChange={(checked) => {
                                    if (checked)
                                      setPropertyTypes([...propertyTypes, type])
                                    else
                                      setPropertyTypes(
                                        propertyTypes.filter((p) => p !== type)
                                      )
                                  }}
                                />
                                <Label className="text-[16px]">{type}</Label>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {filter === 'Litigation Status' &&
                      selectedFilters.includes('Litigation Status') && (
                        <div className="space-y-2 p-6">
                          <RadioGroup
                            value={litigation ?? ''}
                            onValueChange={(val) => setLitigation(val)}
                            className="flex gap-10"
                          >
                            {['Disputed', 'Non-Disputed'].map((opt) => (
                              <div
                                key={opt}
                                className="flex items-center gap-3"
                              >
                                <RadioGroupItem value={opt} id={opt} />
                                <Label htmlFor={opt} className="text-[16px]">
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                    {filter === 'Owner' &&
                      selectedFilters.includes('Owner') && (
                        <div className="pl-6">
                          <Input
                            placeholder="Enter Owner"
                            value={ownerInput}
                            onChange={(e) => setOwnerInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleAddItem('owner')
                            }
                            className="h-10 w-[70%] rounded-full"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {owners.map((owner) => (
                              <span
                                key={owner}
                                className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                              >
                                {owner}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveItem('owner', owner)
                                  }
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {filter === 'Tag' && selectedFilters.includes('Tag') && (
                      <div className="pl-6">
                        <Input
                          placeholder="Enter Tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleAddItem('tag')
                          }
                          className="h-10 w-[70%] rounded-full"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                            >
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveItem('tag', tag)}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <Button
                  className="hover:bg-secondary text-secondary h-11 w-[200px] border border-gray-400 bg-white font-semibold hover:text-white"
                  onClick={handleGenerate}
                >
                  Generate <Sparkles className="text-primary ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StandAloneForm
