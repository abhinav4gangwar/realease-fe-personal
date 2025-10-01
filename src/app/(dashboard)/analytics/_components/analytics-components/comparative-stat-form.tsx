'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

const ComparativeStatForm = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [numAssets, setNumAssets] = useState<number | null>(null)
  const [acrossType, setAcrossType] = useState<string>('')
  const [considerType, setConsiderType] = useState<string>('')
  
  // Customizations array to hold multiple customization blocks
  const [customizations, setCustomizations] = useState<any[]>([
    {
      id: Date.now(),
      selectedOption: '',
      locationType: null,
      locations: [],
      locationInput: '',
      propertyTypes: [],
      litigation: null,
      owners: [],
      ownerInput: '',
      tags: [],
      tagInput: '',
    }
  ])

  const handleAddItem = (customizationId: number, type: string) => {
    setCustomizations(prevCustomizations =>
      prevCustomizations.map(custom => {
        if (custom.id !== customizationId) return custom

        if (type === 'location' && custom.locationInput.trim()) {
          return {
            ...custom,
            locations: [...custom.locations, custom.locationInput.trim()],
            locationInput: ''
          }
        }
        if (type === 'owner' && custom.ownerInput.trim()) {
          return {
            ...custom,
            owners: [...custom.owners, custom.ownerInput.trim()],
            ownerInput: ''
          }
        }
        if (type === 'tag' && custom.tagInput.trim()) {
          return {
            ...custom,
            tags: [...custom.tags, custom.tagInput.trim()],
            tagInput: ''
          }
        }
        return custom
      })
    )
  }

  const handleRemoveItem = (customizationId: number, type: string, value: string) => {
    setCustomizations(prevCustomizations =>
      prevCustomizations.map(custom => {
        if (custom.id !== customizationId) return custom

        if (type === 'location') {
          return { ...custom, locations: custom.locations.filter((i: string) => i !== value) }
        }
        if (type === 'owner') {
          return { ...custom, owners: custom.owners.filter((i: string) => i !== value) }
        }
        if (type === 'tag') {
          return { ...custom, tags: custom.tags.filter((i: string) => i !== value) }
        }
        return custom
      })
    )
  }

  const updateCustomization = (customizationId: number, field: string, value: any) => {
    setCustomizations(prevCustomizations =>
      prevCustomizations.map(custom =>
        custom.id === customizationId ? { ...custom, [field]: value } : custom
      )
    )
  }

  const addMoreCustomization = () => {
    setCustomizations([
      ...customizations,
      {
        id: Date.now(),
        selectedOption: '',
        locationType: null,
        locations: [],
        locationInput: '',
        propertyTypes: [],
        litigation: null,
        owners: [],
        ownerInput: '',
        tags: [],
        tagInput: '',
      }
    ])
  }

  const removeCustomization = (customizationId: number) => {
    if (customizations.length > 1) {
      setCustomizations(customizations.filter(custom => custom.id !== customizationId))
    }
  }

  const handleGenerate = () => {
    const formData = {
      numAssets,
      acrossType,
      considerType,
      customizations: considerType === 'Specific' ? customizations : []
    }

    console.log('Form Data:', JSON.stringify(formData, null, 2))
    onClose()
  }

  const showCustomizations = considerType === 'Specific'

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[600px] flex-col border-l bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-xl font-semibold">Add Comparative Stat</h2>
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
              {/* First Field - Number and Across Type */}
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-lg">I want to consider</Label>
                <select
                  className="rounded border border-gray-400 p-2"
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
                <Label className="text-lg">of assets across</Label>
                <select
                  className="rounded border border-gray-400 p-2"
                  value={acrossType}
                  onChange={(e) => setAcrossType(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Location">Location</option>
                  <option value="Property Type">Property Type</option>
                  <option value="Litigation Status">Litigation Status</option>
                  <option value="Owner">Owner</option>
                  <option value="Tag">Tag</option>
                </select>
              </div>

              {/* Second Field - All or Specific */}
              {acrossType && (
                <div className="flex items-center gap-2">
                  <Label className="text-lg">I want to consider</Label>
                  <select
                    className="rounded border border-gray-400 p-2"
                    value={considerType}
                    onChange={(e) => setConsiderType(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="All">All</option>
                    <option value="Specific">Specific</option>
                  </select>
                </div>
              )}

              {/* Customizations Section */}
              {showCustomizations && (
                <div className="space-y-6">
                  {customizations.map((customization, index) => (
                    <div key={customization.id} className="rounded-lg border border-gray-300 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <Label className="text-lg font-semibold">
                          Customization {index + 1}
                        </Label>
                        {customizations.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-500"
                            onClick={() => removeCustomization(customization.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Select Option */}
                      <div className="mb-4">
                        <Label className="mb-2 text-base">
                          I want to consider only the following
                        </Label>
                        <select
                          className="mt-2 w-full rounded border border-gray-400 p-2"
                          value={customization.selectedOption}
                          onChange={(e) =>
                            updateCustomization(
                              customization.id,
                              'selectedOption',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="Localities">Localities</option>
                          <option value="Cities">Cities</option>
                          <option value="States">States</option>
                          <option value="Countries">Countries</option>
                          <option value="Property Types">Property Types</option>
                          <option value="Litigation Status">Litigation Status</option>
                          <option value="Owner">Owner</option>
                          <option value="Tag">Tag</option>
                        </select>
                      </div>

                      {/* Location Types (Localities, Cities, States, Countries) */}
                      {['Localities', 'Cities', 'States', 'Countries'].includes(
                        customization.selectedOption
                      ) && (
                        <div className="mt-4">
                          <Input
                            placeholder={`Enter ${customization.selectedOption}`}
                            value={customization.locationInput}
                            onChange={(e) =>
                              updateCustomization(
                                customization.id,
                                'locationInput',
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              handleAddItem(customization.id, 'location')
                            }
                            className="h-10 w-full rounded-full"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {customization.locations.map((loc: string) => (
                              <span
                                key={loc}
                                className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                              >
                                {loc}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveItem(
                                      customization.id,
                                      'location',
                                      loc
                                    )
                                  }
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Property Types */}
                      {customization.selectedOption === 'Property Types' && (
                        <div className="mt-4 space-y-3">
                          {['Residential', 'Commercial', 'Land', 'Plot'].map((type) => (
                            <div key={type} className="flex items-center gap-2">
                              <Checkbox
                                checked={customization.propertyTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  const newTypes = checked
                                    ? [...customization.propertyTypes, type]
                                    : customization.propertyTypes.filter(
                                        (p: string) => p !== type
                                      )
                                  updateCustomization(
                                    customization.id,
                                    'propertyTypes',
                                    newTypes
                                  )
                                }}
                              />
                              <Label className="text-[16px]">{type}</Label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Litigation Status */}
                      {customization.selectedOption === 'Litigation Status' && (
                        <div className="mt-4">
                          <RadioGroup
                            value={customization.litigation ?? ''}
                            onValueChange={(val) =>
                              updateCustomization(customization.id, 'litigation', val)
                            }
                            className="flex gap-10"
                          >
                            {['Disputed', 'Non-Disputed'].map((opt) => (
                              <div key={opt} className="flex items-center gap-3">
                                <RadioGroupItem value={opt} id={`${customization.id}-${opt}`} />
                                <Label htmlFor={`${customization.id}-${opt}`} className="text-[16px]">
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {/* Owner */}
                      {customization.selectedOption === 'Owner' && (
                        <div className="mt-4">
                          <Input
                            placeholder="Enter Owner"
                            value={customization.ownerInput}
                            onChange={(e) =>
                              updateCustomization(
                                customization.id,
                                'ownerInput',
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              handleAddItem(customization.id, 'owner')
                            }
                            className="h-10 w-full rounded-full"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {customization.owners.map((owner: string) => (
                              <span
                                key={owner}
                                className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                              >
                                {owner}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveItem(customization.id, 'owner', owner)
                                  }
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tag */}
                      {customization.selectedOption === 'Tag' && (
                        <div className="mt-4">
                          <Input
                            placeholder="Enter Tag"
                            value={customization.tagInput}
                            onChange={(e) =>
                              updateCustomization(
                                customization.id,
                                'tagInput',
                                e.target.value
                              )
                            }
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleAddItem(customization.id, 'tag')
                            }
                            className="h-10 w-full rounded-full"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {customization.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-2 text-sm"
                              >
                                {tag}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    handleRemoveItem(customization.id, 'tag', tag)
                                  }
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add More Customizations Button */}
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={addMoreCustomization}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Customizations
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <Button
                  className="hover:bg-secondary text-secondary h-11 w-[200px] border border-gray-400 bg-white font-semibold hover:text-white"
                  onClick={handleGenerate}
                  disabled={!numAssets || !acrossType || !considerType}
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

export default ComparativeStatForm