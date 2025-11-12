'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { apiClient } from '@/utils/api'
import { Check, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  analyticsHelpers,
  Tag,
} from './analytics-helper/analytics-helper-service'

interface AutocompleteInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (value: string) => void
  suggestions: string[]
  loading?: boolean
}

const AutocompleteInput = ({
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
  loading = false,
}: AutocompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        onSelect(filteredSuggestions[highlightedIndex])
        setIsOpen(false)
        setHighlightedIndex(-1)
      } else if (value.trim()) {
        onSelect(value.trim())
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="h-10 rounded-full"
      />
      {isOpen && value && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`cursor-pointer p-3 text-sm hover:bg-gray-100 ${
                  index === highlightedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  onSelect(suggestion)
                  setIsOpen(false)
                  setHighlightedIndex(-1)
                }}
              >
                {suggestion}
                {index === highlightedIndex && (
                  <Check className="ml-2 inline h-4 w-4" />
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ComparativeStatForm = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) => {
  const [title, setTitle] = useState('')
  const [insight, setInsight] = useState('')
  const [metricType, setMetricType] = useState<'count' | 'value'>('count')
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut' | 'line' | 'area'>('bar')
  const [groupBy, setGroupBy] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Global suggestions data
  const [localitiesSuggestions, setLocalitiesSuggestions] = useState<string[]>([])
  const [citiesSuggestions, setCitiesSuggestions] = useState<string[]>([])
  const [statesSuggestions, setStatesSuggestions] = useState<string[]>([])
  const [countriesSuggestions, setCountriesSuggestions] = useState<string[]>([])
  const [ownerSuggestions, setOwnerSuggestions] = useState<string[]>([])
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([])
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({})

  // Secondary filters
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [locationType, setLocationType] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState('')
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [litigation, setLitigation] = useState<string | null>(null)
  const [owners, setOwners] = useState<string[]>([])
  const [ownerInput, setOwnerInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Fetch all data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingData({
        localities: true,
        cities: true,
        states: true,
        countries: true,
        owners: true,
        tags: true,
      })

      try {
        const [localities, cities, states, countries, owners, tags] =
          await Promise.all([
            analyticsHelpers.fetchLocalities(),
            analyticsHelpers.fetchCities(),
            analyticsHelpers.fetchStates(),
            analyticsHelpers.fetchCountries(),
            analyticsHelpers.fetchOwners(),
            analyticsHelpers.fetchTags(),
          ])

        setLocalitiesSuggestions(localities)
        setCitiesSuggestions(cities)
        setStatesSuggestions(states)
        setCountriesSuggestions(countries)
        setOwnerSuggestions(owners)
        setTagSuggestions(tags)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoadingData({})
      }
    }

    if (isOpen) {
      fetchAllData()
    }
  }, [isOpen])

  const getLocationSuggestions = () => {
    switch (locationType) {
      case 'Localities':
        return localitiesSuggestions
      case 'Cities':
        return citiesSuggestions
      case 'States':
        return statesSuggestions
      case 'Countries':
        return countriesSuggestions
      default:
        return []
    }
  }

  const handleAddLocation = (value: string) => {
    if (value.trim() && !locations.includes(value.trim())) {
      setLocations([...locations, value.trim()])
      setLocationInput('')
    }
  }

  const handleAddOwner = (value: string) => {
    if (value.trim() && !owners.includes(value.trim())) {
      setOwners([...owners, value.trim()])
      setOwnerInput('')
    }
  }

  const handleAddTag = (value: string) => {
    if (value.trim() && !tags.includes(value.trim())) {
      setTags([...tags, value.trim()])
      setTagInput('')
    }
  }

  const handleRemoveItem = (type: string, value: string) => {
    if (type === 'location') setLocations(locations.filter((i) => i !== value))
    if (type === 'owner') setOwners(owners.filter((i) => i !== value))
    if (type === 'tag') setTags(tags.filter((i) => i !== value))
  }

  const mapGroupByToApi = (groupByValue: string): string => {
    const mapping: Record<string, string> = {
      'Localities': 'localities',
      'Cities': 'cities',
      'States': 'states',
      'Countries': 'countries',
      'Property Type': 'propertyType',
      'Litigation Status': 'litigationStatus',
      'Owner': 'owner',
      'Tag': 'tag',
    }
    return mapping[groupByValue] || groupByValue.toLowerCase()
  }

  const buildSecondaryFilters = () => {
    const filters: Array<{ type: string; value: string }> = []

    // Location filters
    if (locationType && locations.length > 0) {
      const locationTypeMap: Record<string, string> = {
        Localities: 'locality',
        Cities: 'city',
        States: 'state',
        Countries: 'country',
      }
      const filterType = locationTypeMap[locationType]
      locations.forEach((loc) => {
        filters.push({ type: filterType, value: loc })
      })
    }

    // Property type filters
    propertyTypes.forEach((type) => {
      filters.push({ type: 'propertyType', value: type })
    })

    // Litigation status
    if (litigation) {
      filters.push({
        type: 'litigationStatus',
        value: litigation.toLowerCase(),
      })
    }

    // Owner filters
    owners.forEach((owner) => {
      filters.push({ type: 'owner', value: owner })
    })

    // Tag filters
    tags.forEach((tag) => {
      filters.push({ type: 'tag', value: tag })
    })

    return filters
  }

  const handleGenerate = async () => {
    // Validation
    if (!title.trim()) {
      alert('Please enter a title for the analytics card')
      return
    }

    if (!groupBy) {
      alert('Please select what to group by')
      return
    }

    setIsGenerating(true)

    try {
      const requestBody = {
        type: 'chart',
        title: title.trim(),
        insight: insight.trim() || undefined,
        analyticsType: 'comparative',
        metricType: metricType,
        groupBy: mapGroupByToApi(groupBy),
        chartType: chartType,
        secondaryFilters: buildSecondaryFilters(),
        displayColor: 'secondary',
      }

      console.log('Request Body:', JSON.stringify(requestBody, null, 2))

      const response = await apiClient.post('/analytics', requestBody)

      if (response.data) {
        toast.message("Analytics Created.")
        console.log('Comparative analytics card created:', response.data)
        
        // Reset form
        setTitle('')
        setInsight('')
        setMetricType('count')
        setChartType('bar')
        setGroupBy('')
        setSelectedFilters([])
        setLocationType(null)
        setLocations([])
        setPropertyTypes([])
        setLitigation(null)
        setOwners([])
        setTags([])
        
        onSuccess?.()
        onClose()
      }
    } catch (error: any) {
      console.error('Failed to create comparative analytics card:', error)
      toast.message("Failed to Create Analytics")
    } finally {
      setIsGenerating(false)
    }
  }

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
              {/* Title and Insight */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Title *</Label>
                  <Input
                    placeholder="E.g., Assets by City"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-base font-medium">
                    Description (Optional)
                  </Label>
                  <Input
                    placeholder="Brief description of this analytics card"
                    value={insight}
                    onChange={(e) => setInsight(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Metric Type */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Metric Type</Label>
                <RadioGroup
                  value={metricType}
                  onValueChange={(val) => setMetricType(val as 'count' | 'value')}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="count" id="count" />
                    <Label htmlFor="count" className="text-[16px]">
                      Count (Number of assets)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="value" id="value" />
                    <Label htmlFor="value" className="text-[16px]">
                      Value (Total asset value)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Group By */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Group By *</Label>
                <select
                  className="mt-2 w-full rounded border border-gray-400 p-2"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="">Select grouping dimension</option>
                  <option value="Localities">Localities</option>
                  <option value="Cities">Cities</option>
                  <option value="States">States</option>
                  <option value="Countries">Countries</option>
                  <option value="Property Type">Property Type</option>
                  <option value="Litigation Status">Litigation Status</option>
                  <option value="Owner">Owner</option>
                  <option value="Tag">Tag</option>
                </select>
              </div>

              {/* Chart Type */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Chart Type</Label>
                <select
                  className="mt-2 w-full rounded border border-gray-400 p-2"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="donut">Donut Chart</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <Label className="text-lg font-medium">
                  Secondary Filters (Optional)
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Apply additional filters to narrow down the data
                </p>
              </div>

              {/* Secondary Filters */}
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
                            // Reset related state
                            if (filter === 'Location') {
                              setLocationType(null)
                              setLocations([])
                            }
                            if (filter === 'Property Type') setPropertyTypes([])
                            if (filter === 'Litigation Status') setLitigation(null)
                            if (filter === 'Owner') setOwners([])
                            if (filter === 'Tag') setTags([])
                          }
                        }}
                      />
                      <Label className="text-[16px]">{filter}</Label>
                    </div>

                    {/* Location */}
                    {filter === 'Location' &&
                      selectedFilters.includes('Location') && (
                        <div className="p-6">
                          <RadioGroup
                            value={locationType ?? ''}
                            onValueChange={(val) => {
                              setLocationType(val)
                              setLocationInput('')
                              setLocations([])
                            }}
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
                              <AutocompleteInput
                                placeholder={`Type here to enter the selections of ${locationType}`}
                                value={locationInput}
                                onChange={setLocationInput}
                                onSelect={handleAddLocation}
                                suggestions={getLocationSuggestions()}
                                loading={loadingData[locationType.toLowerCase()]}
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

                    {/* Property Type */}
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

                    {/* Litigation Status */}
                    {filter === 'Litigation Status' &&
                      selectedFilters.includes('Litigation Status') && (
                        <div className="space-y-2 p-6">
                          <RadioGroup
                            value={litigation ?? ''}
                            onValueChange={(val) => setLitigation(val)}
                            className="flex gap-10"
                          >
                            {['disputed', 'non-disputed'].map((opt) => (
                              <div
                                key={opt}
                                className="flex items-center gap-3"
                              >
                                <RadioGroupItem value={opt} id={opt} />
                                <Label htmlFor={opt} className="text-[16px] capitalize">
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                    {/* Owner */}
                    {filter === 'Owner' &&
                      selectedFilters.includes('Owner') && (
                        <div className="pl-6">
                          <AutocompleteInput
                            placeholder="Enter Owner"
                            value={ownerInput}
                            onChange={setOwnerInput}
                            onSelect={handleAddOwner}
                            suggestions={ownerSuggestions}
                            loading={loadingData.owners}
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

                    {/* Tag */}
                    {filter === 'Tag' && selectedFilters.includes('Tag') && (
                      <div className="pl-6">
                        <AutocompleteInput
                          placeholder="Enter Tag"
                          value={tagInput}
                          onChange={setTagInput}
                          onSelect={handleAddTag}
                          suggestions={tagSuggestions.map((tag) => tag.name)}
                          loading={loadingData.tags}
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
                  className="hover:bg-secondary text-secondary h-11 w-[200px] border border-gray-400 bg-white font-semibold hover:text-white disabled:opacity-50"
                  onClick={handleGenerate}
                  disabled={isGenerating || !title.trim() || !groupBy}
                >
                  {isGenerating ? 'Creating...' : 'Generate'}{' '}
                  <Sparkles className="text-primary ml-2" />
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