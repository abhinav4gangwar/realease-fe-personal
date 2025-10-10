'use client'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLocationAutoFill } from '@/hooks/useLocationAutoFill'
import { cn } from '@/lib/utils'
import { CountryType, Properties } from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { formatCoordinates, parseCoordinates } from '@/utils/coordinateUtils'
import { CommandEmpty } from 'cmdk'
import { Country } from 'country-state-city'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Loader2,
  MoveRight,
  Pencil,
  Plus,
  PlusIcon,
  Trash,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileItem, PropertyUploadDropzone } from './document-upload'

export interface CustomField {
  id: string
  label: string
  value: string
}

interface PropertiesEditModelProps {
  property: Properties | null
  isOpen: boolean
  onClose: () => void
  handleAddAnother: () => void
  onArchiveClick?: (property: Properties) => void
  setSelectedProperty?: (property: Properties | null) => void
}

const PropertiesEditModel = ({
  property,
  isOpen,
  onClose,
  handleAddAnother,
  onArchiveClick,
  setSelectedProperty,
}: PropertiesEditModelProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDisputed, setIsDisputed] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [documentFiles, setDocumentFiles] = useState<FileItem[]>([])
  const [isDocumentUploading, setIsDocumentUploading] = useState(false)
  const [isDuplicateEnabled, setIsDuplicateEnabled] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState('')
  const [duplicateNames, setDuplicateNames] = useState<string[]>([])
  const [createdDuplicates, setCreatedDuplicates] = useState<any[]>([])
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false)

  const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(null)
  const [countries, setCountries] = useState<CountryType[]>([])

  const [partyA, setPartyA] = useState('')
  const [partyB, setPartyB] = useState('')

  const [selectedUnit, setSelectedUnit] = useState<string>('acres')

  const [formData, setFormData] = useState<Properties>({
    name: '',
    type: '',
    owner: '',
    country: '',
    zipcode: '',
    address: '',
    location: '',
    district: '',
    city: '',
    state: '',
    coordinates: '',
    latitude: '',
    longitude: '',
    isDisputed: false,
    legalStatus: "",
    legalParties: '',
    caseNumber: '',
    caseType: '',
    nextHearing: '',
    extent: '',
    valuePerSQ: '',
    value: '',
  })

  const unitsForType = (type: string) => {
    switch (type) {
      case 'Land':
        return [
          { value: 'acres', label: 'Acres' },
          { value: 'hectares', label: 'Hectares' },
        ]
      case 'Residential':
      case 'Commercial':
        return [
          { value: 'sqft', label: 'Square Feet' },
          { value: 'sqm', label: 'Square Meters' },
        ]
      case 'Plot':
        return []
      default:
        return []
    }
  }

  const unitLabels = {
    acres: { plural: 'acres', singular: 'acre' },
    hectares: { plural: 'hectares', singular: 'hectare' },
    sqyd: { plural: 'square yards', singular: 'square yard' },
    sqft: { plural: 'square feet', singular: 'square foot' },
    sqm: { plural: 'square meters', singular: 'square meter' },
  }

  const getUnitLabel = (unit: string, isPlural: boolean = true) => {
    const label = unitLabels[unit as keyof typeof unitLabels]
    if (!label) return 'units'
    return isPlural ? label.plural : label.singular
  }

  const handleNumericChange = (field: keyof Properties) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
    updateFormData(field, value);
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude') => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow only one sign at the beginning
    if (val.startsWith('+') || val.startsWith('-')) {
      val = val[0] + val.slice(1).replace(/[^0-9.]/g, '');
    } else {
      val = val.replace(/[^0-9.]/g, '');
    }
    // Ensure only one decimal point
    val = val.replace(/(\..*?)\./g, '$1');
    updateFormData(field, val);
    // Update coordinates field for backward compatibility
    if (field === 'latitude' && val && formData.longitude) {
      const coordinateString = formatCoordinates(val, formData.longitude);
      updateFormData('coordinates', coordinateString);
    } else if (field === 'longitude' && formData.latitude && val) {
      const coordinateString = formatCoordinates(formData.latitude, val);
      updateFormData('coordinates', coordinateString);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('nextHearing', e.target.value);
  };

  useEffect(() => {
    // Set default unit based on property type
    let defaultUnit = 'acres'
    switch (formData.type) {
      case 'Plot':
        defaultUnit = 'sqyd'
        break
      case 'Land':
        defaultUnit = 'acres'
        break
      case 'Residential':
      case 'Commercial':
        defaultUnit = 'sqft'
        break
    }
    setSelectedUnit(defaultUnit)
  }, [formData.type])

  // Auto-calculate total value
  useEffect(() => {
    // Extract numeric value from extent (remove unit text)
    const extentString = formData.extent || ''
    const extentMatch = extentString.match(/^[\d.]+/)
    const extentNum = extentMatch ? parseFloat(extentMatch[0]) : NaN
    
    const perNum = parseFloat(formData.valuePerSQ)
    
    if (!isNaN(extentNum) && !isNaN(perNum) && extentNum > 0 && perNum > 0) {
      const total = extentNum * perNum
      updateFormData('value', total.toFixed(2))
    } else if (formData.extent === '' || formData.valuePerSQ === '') {
      updateFormData('value', '')
    }
  }, [formData.extent, formData.valuePerSQ])

  useEffect(() => {
    // Load all countries on component mount
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  useEffect(() => {
    if (property && isOpen) {
      // Handle coordinate format conversion from backend
      let coordinates = property.coordinates || ''
      let latitude = (property as any).latitude?.toString() || ''
      let longitude = (property as any).longitude?.toString() || ''

      // If we have separate latitude/longitude from backend, use them
      if ((property as any).latitude && (property as any).longitude) {
        latitude = (property as any).latitude.toString()
        longitude = (property as any).longitude.toString()
        coordinates = formatCoordinates(latitude, longitude)
      }
      // If we only have coordinates string, parse it to get separate values
      else if (coordinates) {
        const parsed = parseCoordinates(coordinates)
        if (parsed) {
          latitude = parsed.latitude
          longitude = parsed.longitude
        }
      }

      // Parse legal parties if they exist
      if (property.legalParties) {
        const parties = property.legalParties.split(' vs ')
        if (parties.length === 2) {
          setPartyA(parties[0].trim())
          setPartyB(parties[1].trim())
        } else {
          setPartyA(property.legalParties)
          setPartyB('')
        }
      }

      // Parse extent to extract numeric value and unit
      let extentValue = property.extent || ''
      if (extentValue) {
        const match = extentValue.match(/^([\d.]+)\s*(.*)$/)
        if (match) {
          extentValue = match[1] // Just the numeric part
        }
      }

      setFormData({
        ...property,
        extent: extentValue,
        coordinates, // Use the formatted coordinates for backward compatibility
        latitude,    // Set separate latitude
        longitude,   // Set separate longitude
      })
      setIsDisputed(property.isDisputed || false)

      // Extract custom fields from additionalDetails if they exist
      if (property.additionalDetails) {
        const customFieldsFromProperty = Object.entries(
          property.additionalDetails
        ).map(([key, value], index) => ({
          id: `custom-${index}`,
          label: key,
          value: String(value),
        }))
        setCustomFields(customFieldsFromProperty)
      }
    }
  }, [property, isOpen])

  useEffect(() => {
    if (property && isOpen) {
      if (formData.country) {
        const country = countries.find(c => c.name === formData.country)
        if (country) {
          setSelectedCountry(country)
        }
      }
    }
  }, [property, isOpen, countries, formData.country])

  useEffect(() => {
    if (selectedCountry) {
      updateFormData('country', selectedCountry.name)
    }
  }, [selectedCountry])

  // Track if we're currently auto-filling to prevent infinite loops
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [lastAutoFilledZipcode, setLastAutoFilledZipcode] = useState('')

  // Location auto-fill functionality (city and state only, no coordinates)
  const {
    isLoading: isLocationLoading,
    error: locationError,
    isValidZipcode,
  } = useLocationAutoFill({
    country: selectedCountry?.name || '',
    zipcode: formData.zipcode || '',
    onLocationFound: (location) => {
      // Prevent infinite loops by checking if we're already auto-filling
      if (isAutoFilling || lastAutoFilledZipcode === formData.zipcode) {
        return
      }

      setIsAutoFilling(true)
      setLastAutoFilledZipcode(formData.zipcode || '')

      // Only auto-select country if none is selected or if it matches the current selection
      if (!selectedCountry) {
        const foundCountry = countries.find(c =>
          c.name.toLowerCase().includes(location.country.toLowerCase()) ||
          c.isoCode.toLowerCase() === location.countryCode.toLowerCase()
        )

        if (foundCountry) {
          console.log('🌍 Auto-selecting country:', foundCountry.name)
          setSelectedCountry(foundCountry)
        }
      } else {
        // Verify the current country matches the location result
        const currentCountryMatches =
          selectedCountry.name.toLowerCase().includes(location.country.toLowerCase()) ||
          selectedCountry.isoCode.toLowerCase() === location.countryCode.toLowerCase()

        if (!currentCountryMatches) {
          console.log('⚠️ Country mismatch - keeping user selection:', selectedCountry.name)
        }
      }

      // Auto-fill state and city from location data (NO COORDINATES)
      console.log('🏛️ Auto-filling state:', location.state)
      updateFormData('state', location.state)

      console.log('🏙️ Auto-filling city:', location.city)
      updateFormData('city', location.city)

      // Reset auto-filling flag after a short delay
      setTimeout(() => {
        setIsAutoFilling(false)
      }, 100)
    },
    autoTrigger: !isAutoFilling, // Only auto-trigger when not already auto-filling
    debounceMs: 1000,
  })

  // Reset auto-fill tracking when zipcode changes manually
  useEffect(() => {
    if (formData.zipcode !== lastAutoFilledZipcode) {
      setLastAutoFilledZipcode('')
    }
  }, [formData.zipcode, lastAutoFilledZipcode])

  const updateFormData = (field: keyof Properties, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom-${Date.now()}`,
      label: 'Custom Field',
      value: '',
    }
    setCustomFields((prev) => [...prev, newField])
  }

  const updateCustomField = (
    id: string,
    field: 'label' | 'value',
    newValue: string
  ) => {
    setCustomFields((prev) =>
      prev.map((customField) =>
        customField.id === id
          ? { ...customField, [field]: newValue }
          : customField
      )
    )
  }

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id))
  }

  const CountrySelect = () => {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const filteredCountries = countries.filter(country =>
      country.name.toLowerCase().includes(searchValue.toLowerCase())
    )

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 truncate"
          >
            {selectedCountry?.name || "Select Country"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-gray-400" align="start">
          <Command>
            <CommandInput 
              placeholder="Search country..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.isoCode}
                    value={country.name}
                    onSelect={() => {
                      setSelectedCountry(country)
                      setOpen(false)
                      setSearchValue('')
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountry?.isoCode === country.isoCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {country.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  const resetForm = () => {
    if (property) {
      // Handle coordinate format conversion from backend
      let coordinates = property.coordinates || ''
      let latitude = (property as any).latitude?.toString() || ''
      let longitude = (property as any).longitude?.toString() || ''

      // If we have separate latitude/longitude from backend, use them
      if ((property as any).latitude && (property as any).longitude) {
        latitude = (property as any).latitude.toString()
        longitude = (property as any).longitude.toString()
        coordinates = formatCoordinates(latitude, longitude)
      }
      // If we only have coordinates string, parse it to get separate values
      else if (coordinates) {
        const parsed = parseCoordinates(coordinates)
        if (parsed) {
          latitude = parsed.latitude
          longitude = parsed.longitude
        }
      }

      // Parse extent to extract numeric value
      let extentValue = property.extent || ''
      if (extentValue) {
        const match = extentValue.match(/^([\d.]+)\s*(.*)$/)
        if (match) {
          extentValue = match[1]
        }
      }

      setFormData({
        ...property,
        extent: extentValue,
        coordinates, // Use the formatted coordinates for backward compatibility
        latitude,    // Set separate latitude
        longitude,   // Set separate longitude
      })
      setIsDisputed(property.isDisputed || false)

      if (property.additionalDetails) {
        const customFieldsFromProperty = Object.entries(
          property.additionalDetails
        ).map(([key, value], index) => ({
          id: `custom-${index}`,
          label: key,
          value: String(value),
        }))
        setCustomFields(customFieldsFromProperty)
      } else {
        setCustomFields([])
      }
    }
    setCurrentStep(1)
    setIsSubmitted(false)
    setDocumentFiles([])
    setIsDocumentUploading(false)
    setIsDuplicateEnabled(false)
    setDuplicateCount('')
    setDuplicateNames([])
    setCreatedDuplicates([])
    setShowDuplicatesModal(false)
    setPartyA('')
    setPartyB('')
    setSelectedCountry(null)
  }

  const updateProperty = async () => {
    if (!property?.id) {
      toast.error('Property ID not found')
      return false
    }

    try {
      setIsLoading(true)

      const additionalDetails = customFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.label]: field.value,
        }),
        {}
      )

      const legalPartiesValue =
        partyA.trim() && partyB.trim()
          ? `${partyA.trim()} vs ${partyB.trim()}`
          : partyA.trim() || partyB.trim() || ''

      const currentUnit = formData.type === 'Plot' ? 'sqyd' : selectedUnit;
      const extentWithUnit = formData.extent ? `${formData.extent} ${getUnitLabel(currentUnit, true)}` : '';

      let nextHearingFormatted = '';
      if (formData.nextHearing) {
        const clean = formData.nextHearing.replace(/\D/g, '');
        if (clean.length === 8) {
          const dd = clean.substring(0, 2);
          const mm = clean.substring(2, 4);
          const yyyy = clean.substring(4, 8);
          nextHearingFormatted = `${yyyy}-${mm}-${dd}`;
        }
      }

      const requestBody = {
        name: formData.name,
        type: formData.type,
        owner: formData.owner,
        country: formData.country,
        zipcode: formData.zipcode,
        address: formData.address,
        location: formData.location,
        locality: formData.location,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        // Send coordinates as decimal numbers expected by backend
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        // Keep the original coordinates field for backward compatibility
        coordinates: formData.coordinates,
        isDisputed: isDisputed,
        legalStatus: formData.legalStatus,
        legalParties: legalPartiesValue,
        caseNumber: formData.caseNumber,
        caseType: formData.caseType,
        nextHearing: nextHearingFormatted,
        extent: extentWithUnit,
        valuePerSQ: formData.valuePerSQ,
        additionalDetails:
          Object.keys(additionalDetails).length > 0
            ? additionalDetails
            : undefined,
      }

      const response = await apiClient.put(
        `/dashboard/properties/edit/${property.id}`,
        requestBody
      )

      toast.success('Property updated successfully!')
      return true
    } catch (error: any) {
      console.error('Property update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update property')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (documentFiles.length === 0) {
      return true
    }

    if (!property?.id) {
      toast.error('Property ID not found')
      return false
    }

    try {
      setIsDocumentUploading(true)

      const formDataUpload = new FormData()
      documentFiles.forEach(({ file }) => {
        formDataUpload.append('files', file)
      })

      // Add metadata
      const metadata = documentFiles.map(({ name }) => ({
        name: name,
        path: name,
        propertyId: property.id,
        tags: '',
      }))

      formDataUpload.append('meta', JSON.stringify(metadata))
      formDataUpload.append('parentId', '')

      const response = await apiClient.post(
        '/dashboard/documents/upload',
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      toast.success(response.data.message || 'Documents uploaded successfully!')
      setDocumentFiles([])
      return true
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
      return false
    } finally {
      setIsDocumentUploading(false)
    }
  }

  const createDuplicateProperties = async () => {
    if (!property?.id) {
      toast.error('Property ID not found')
      return false
    }

    const count = parseInt(duplicateCount)
    if (isNaN(count) || count < 1) {
      toast.error('Please enter a valid number of duplicates')
      return false
    }

    try {
      setIsLoading(true)

      const additionalDetails = customFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.label]: field.value,
        }),
        {}
      )

      const legalPartiesValue =
        partyA.trim() && partyB.trim()
          ? `${partyA.trim()} vs ${partyB.trim()}`
          : partyA.trim() || partyB.trim() || ''

      const currentUnit = formData.type === 'Plot' ? 'sqyd' : selectedUnit;
      const extentWithUnit = formData.extent ? `${formData.extent} ${getUnitLabel(currentUnit, true)}` : '';

      let nextHearingFormatted = '';
      if (formData.nextHearing) {
        const clean = formData.nextHearing.replace(/\D/g, '');
        if (clean.length === 8) {
          const dd = clean.substring(0, 2);
          const mm = clean.substring(2, 4);
          const yyyy = clean.substring(4, 8);
          nextHearingFormatted = `${yyyy}-${mm}-${dd}`;
        }
      }

      const requestBody = {
        name: formData.name,
        type: formData.type,
        owner: formData.owner,
        country: formData.country,
        zipcode: formData.zipcode,
        address: formData.address,
        location: formData.location,
        locality: formData.location,
        district: formData.district,
        city: formData.city,
        state: formData.state,
        // Send coordinates as decimal numbers expected by backend
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        // Keep the original coordinates field for backward compatibility
        coordinates: formData.coordinates,
        isDisputed: isDisputed,
        legalStatus: formData.legalStatus,
        legalParties: legalPartiesValue,
        caseNumber: formData.caseNumber,
        caseType: formData.caseType,
        nextHearing: nextHearingFormatted,
        extent: extentWithUnit,
        valuePerSQ: formData.valuePerSQ,
        numberOfDuplicatePlots: count,
        duplicateNames: duplicateNames.length > 0 ? duplicateNames : undefined,
        additionalDetails:
          Object.keys(additionalDetails).length > 0
            ? additionalDetails
            : undefined,
      }

      const response = await apiClient.post(
        '/dashboard/properties/create',
        requestBody
      )

      if (response.data && response.data.properties) {
        setCreatedDuplicates(response.data.properties)
        setShowDuplicatesModal(true)
        toast.success(
          `${response.data.count} duplicate properties created successfully!`
        )
        return true
      }

      throw new Error('Invalid response format')
    } catch (error: any) {
      console.error('Duplicate properties creation error:', error)
      toast.error(
        error.response?.data?.message || 'Failed to create duplicate properties'
      )
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 2) {
      const success = await updateProperty()
      if (success) {
        setCurrentStep(currentStep + 1)
      }
    } else if (currentStep === 3) {
      const uploadSuccess = await handleDocumentUpload()
      if (uploadSuccess) {
        setIsSubmitted(true)
      }
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSaveAndAddAnother = async () => {
    if (currentStep === 3) {
      const uploadSuccess = await handleDocumentUpload()
      if (uploadSuccess) {
        toast.success('Property updated successfully!')
        resetForm()
        handleAddAnother()
      }
    }
  }

  const renderStepForm = () => {
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center space-y-6 p-3">
          <h1 className="text-secondary text-center text-3xl font-bold">
            Property Updated <br /> Successfully
          </h1>
          <div className="flex items-center justify-center">
            <Image
              src={'/assets/property-success.svg'}
              alt="property"
              height={120}
              width={120}
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button
              className="hover:bg-secondary flex h-11 w-[200px] cursor-pointer items-center gap-2 border border-gray-400 bg-transparent px-6 font-semibold text-black hover:text-white"
              onClick={() => {
                handleAddAnother()
                resetForm()
              }}
            >
              Add Another
              <Plus className="size-4" />
            </Button>

            <Button
              className="bg-primary hover:bg-secondary flex h-11 w-[200px] cursor-pointer items-center gap-2 px-6"
              onClick={handleClose}
            >
              Properties
              <MoveRight className="size-4" />
            </Button>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col space-y-5 pb-20">
            <p className="font-light">
              Edit the details below to update the property
            </p>

            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Property Name <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter property name"
                required
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Property Type <span className="text-primary">*</span>
              </label>
              <div>
                {[
                  { value: 'Land', label: 'Land' },
                  { value: 'Plot', label: 'Plot' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Residential', label: 'Residential' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center space-x-3 pb-2"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => updateFormData('type', e.target.value)}
                      className="h-4 w-4 accent-[#f16969]"
                    />
                    <span className="text-secondary text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Owner Name <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                value={formData.owner}
                onChange={(e) => updateFormData('owner', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter owner name"
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="flex flex-col space-y-5 pb-20">
            <p className="font-light">Edit the Property details</p>

            {/* address */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Address <span className="text-primary">*</span>
              </label>
              <div className="rounded-lg border border-gray-400 p-4">
                {/* Row 1: Country and Zipcode */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      Country <span className="text-primary">*</span>
                    </label>
                    <CountrySelect />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      Zip-code <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formData.zipcode}
                        onChange={(e) =>
                          updateFormData('zipcode', e.target.value)
                        }
                        className={`w-full rounded-md border px-3 py-2 pr-10 ${
                          locationError || (!isValidZipcode && formData.zipcode)
                            ? 'border-red-300 focus:border-red-500'
                            : isLocationLoading
                            ? 'border-blue-300 focus:border-blue-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter zip-code"
                        required
                      />

                      {/* Status Icon */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLocationLoading && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {!isLocationLoading && formData.zipcode && isValidZipcode && !locationError && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {(locationError || (!isValidZipcode && formData.zipcode)) && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Status Messages */}
                    {!isValidZipcode && formData.zipcode && (
                      <p className="text-xs text-red-500">
                        Invalid zipcode format for {selectedCountry?.name || 'selected country'}
                      </p>
                    )}
                    {locationError && (
                      <p className="text-xs text-red-500">
                        {locationError}
                      </p>
                    )}
                    {isLocationLoading && (
                      <p className="text-xs text-blue-600">
                        🔍 Looking up location...
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: City and State */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">City</label>
                    <Input
                      type="text"
                      placeholder="Enter city"
                      value={formData.city || ''}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">State</label>
                    <Input
                      type="text"
                      placeholder="Enter state"
                      value={formData.state || ''}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                {/* Row 3: District and Locality */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      District <span className="text-primary">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.district}
                      onChange={(e) =>
                        updateFormData('district', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter district"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      Locality
                    </label>
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        updateFormData('location', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter locality name"
                    />
                  </div>
                </div>

                {/* Row 4: Address Line 1 (Full Width) */}
                <div className="mt-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      Address Line 1
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData('address', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter address details"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* coordinates */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Co-ordinates
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latitude */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">Latitude</label>
                  <Input
                    type="text"
                    value={formData.latitude}
                    onChange={handleCoordinateChange('latitude')}
                    className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                    placeholder="e.g., 32.7767"
                  />
                </div>

                {/* Longitude */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">Longitude</label>
                  <Input
                    type="text"
                    value={formData.longitude}
                    onChange={handleCoordinateChange('longitude')}
                    className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                    placeholder="e.g., -96.797"
                  />
                </div>
              </div>
            </div>

            {/* legal status */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-md text-secondary block font-semibold">
                  Legal Status <span className="text-primary">*</span>
                </label>

                <div className="flex rounded-4xl bg-[#F2F2F2] text-sm">
                  <div
                    className={`${!isDisputed ? 'bg-secondary text-white' : 'bg-transparent text-black'} cursor-pointer rounded-4xl px-4 py-2`}
                    onClick={() => setIsDisputed(false)}
                  >
                    Undisputed
                  </div>
                  <div
                    className={`${isDisputed ? 'bg-secondary text-white' : 'bg-transparent text-black'} cursor-pointer rounded-4xl px-4 py-2`}
                    onClick={() => setIsDisputed(true)}
                  >
                    Disputed
                  </div>
                </div>
              </div>

              {isDisputed && (
                <div className="rounded-lg bg-[#F2F2F2] p-4">
                  <label className="text-md text-secondary block pb-5 font-semibold">
                    Legal Details <span className="text-primary">*</span>
                  </label>

                  <div className="flex flex-col space-y-1 pb-3">
                    <label className="text-md text-secondary block">
                      Case Status <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.legalStatus}
                      onChange={(e) =>
                        updateFormData('legalStatus', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-400 bg-white px-3 py-2 h-14"
                    >
                      <option value="-">Select Case Status</option>
                      <option value="Disputed - Ongoing">Ongoing</option>
                      <option value="Disputed - Disposed">Disposed</option>
                    </select>

                    <label className="text-md text-secondary block">
                      Parties
                    </label>

                    <div className="flex gap-3">
                      <Input
                        type="text"
                        value={partyA}
                        onChange={(e) => setPartyA(e.target.value)}
                        className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                        placeholder="Party A"
                      />

                      <Input
                        type="text"
                        value={partyB}
                        onChange={(e) => setPartyB(e.target.value)}
                        className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                        placeholder="Party B"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="text-md text-secondary block">
                        Case Number
                      </label>
                      <Input
                        type="text"
                        value={formData.caseNumber}
                        onChange={(e) =>
                          updateFormData('caseNumber', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                        placeholder="Enter details"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-md text-secondary block">
                        Next Hearing
                      </label>
                      <Input
                        type="text"
                        value={formData.nextHearing}
                        onChange={handleDateChange}
                        className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                        placeholder="e.g., 25-10-2025"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 py-3">
                    <label className="text-md text-secondary block">
                      Case Type
                    </label>
                    <Input
                      type="text"
                      value={formData.caseType}
                      onChange={(e) =>
                        updateFormData('caseType', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                      placeholder="Enter details"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* extent */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Extent <span className="text-primary">*</span>
              </label>
              {unitsForType(formData.type).length > 0 && (
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                >
                  {unitsForType(formData.type).map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              )}
              <Input
                type="text"
                value={formData.extent}
                onChange={handleNumericChange('extent')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`Enter value in ${getUnitLabel(
                  formData.type === 'Plot' ? 'sqyd' : selectedUnit,
                  true
                )}`}
                required
              />
            </div>

            {/* values */}
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <label className="text-md text-secondary block font-semibold">
                  Value per {getUnitLabel(
                    formData.type === 'Plot' ? 'sqyd' : selectedUnit,
                    false
                  )}{' '}
                  <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.valuePerSQ}
                  onChange={handleNumericChange('valuePerSQ')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-md text-secondary block font-semibold">
                  {formData.type === 'Land'
                    ? 'Land'
                    : formData.type === 'Plot'
                      ? 'Plot'
                      : formData.type}{' '}
                  Value <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.value}
                  onChange={handleNumericChange('value')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="flex flex-col space-y-3">
              {/* Existing custom fields */}
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex flex-col space-y-3 rounded-md bg-[#F8F8F8] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="mr-3 flex flex-1 flex-col space-y-1">
                      <label className="text-md text-secondary block font-semibold">
                        Field Label
                      </label>
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateCustomField(field.id, 'label', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        placeholder="Enter field label"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(field.id)}
                      className="text-primary mt-6 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block font-semibold">
                      Description
                    </label>
                    <Input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        updateCustomField(field.id, 'value', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              ))}

              {/* Add more information button */}
              <div className="flex flex-col space-y-1">
                <div
                  className="flex cursor-pointer justify-between rounded-md bg-[#F2F2F2] p-3 transition-colors hover:bg-[#E8E8E8]"
                  onClick={addCustomField}
                >
                  <p className="text-secondary font-semibold">
                    Add more information
                  </p>
                  <PlusIcon className="size-5" />
                </div>
              </div>
            </div>

            {/* Duplicate Property Section */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-md text-secondary block font-semibold">
                  Duplicate Property
                </label>
                <div className="flex rounded-4xl bg-[#F2F2F2] text-sm">
                  <div
                    className={`${!isDuplicateEnabled ? 'bg-secondary text-white' : 'bg-transparent text-black'} cursor-pointer rounded-4xl px-4 py-2`}
                    onClick={() => setIsDuplicateEnabled(false)}
                  >
                    No
                  </div>
                  <div
                    className={`${isDuplicateEnabled ? 'bg-secondary text-white' : 'bg-transparent text-black'} cursor-pointer rounded-4xl px-4 py-2`}
                    onClick={() => setIsDuplicateEnabled(true)}
                  >
                    Yes
                  </div>
                </div>
              </div>

              {isDuplicateEnabled && (
                <div className="rounded-lg bg-[#F2F2F2] p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex flex-col space-y-1">
                      <label className="text-md text-secondary block font-semibold">
                        Number of Duplicates{' '}
                        <span className="text-primary">*</span>
                      </label>
                      <div className="flex justify-between gap-2">
                        <Input
                          type="text"
                          value={duplicateCount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            setDuplicateCount(value)
                            if (value) {
                              const count = parseInt(value)
                              if (!isNaN(count) && count > 0) {
                                const names = Array.from(
                                  { length: count },
                                  (_, i) => `${formData.name} - ${i + 1}`
                                )
                                setDuplicateNames(names)
                              } else {
                                setDuplicateNames([])
                              }
                            } else {
                              setDuplicateNames([])
                            }
                          }}
                          className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                          placeholder="Enter number of duplicates"
                        />

                        <Button
                          className="bg-secondary h-14 w-14 cursor-pointer font-semibold hover:bg-white hover:text-black"
                          onClick={createDuplicateProperties}
                          disabled={isLoading || !duplicateCount || parseInt(duplicateCount) < 1}
                        >
                          <Check className="size-5" />
                        </Button>
                      </div>
                    </div>

                    {duplicateNames.length > 0 && (
                      <div className="flex flex-col space-y-2">
                        <label className="text-md text-secondary block font-semibold">
                          Duplicate Names (Optional)
                        </label>
                        {duplicateNames.map((name, index) => (
                          <Input
                            key={index}
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const newNames = [...duplicateNames]
                              newNames[index] = e.target.value
                              setDuplicateNames(newNames)
                            }}
                            className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                            placeholder={`Duplicate ${index + 1} name`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <p className="font-semibold">Upload Documents</p>
            <PropertyUploadDropzone
              propertyId={property?.id || null}
              selectedFiles={documentFiles}
              setSelectedFiles={setDocumentFiles}
              isLoading={isDocumentUploading}
            />
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`flex ${!isSubmitted ? 'max-h-[80vh] w-full max-w-4xl' : ''} flex-col space-y-4 rounded-lg border border-gray-400 bg-white shadow-lg`}
      >
        {/* Header */}
        {!isSubmitted && (
          <div className="flex items-center justify-between rounded-t-lg bg-[#F2F2F2] px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                className="hover:text-primary h-8 w-8 cursor-pointer bg-transparent p-0 text-black hover:bg-transparent"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <h2 className="text-secondary text-lg font-semibold">
                Edit Property
              </h2>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-5 w-5 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
              onClick={handleClose}
            >
              <X className="h-4 w-4 font-bold" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">{renderStepForm()}</div>

        {/* Footer */}
        {!isSubmitted && (
          <div className="flex items-center justify-between rounded-b-lg bg-[#F2F2F2] px-4 py-3">
            <div className="flex items-center gap-1">
              {/* Step indicators */}
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`h-2 w-2 rounded-full ${
                    index + 1 === currentStep
                      ? 'bg-primary w-4'
                      : index + 1 < currentStep
                        ? 'bg-gray-300'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-4">
              {currentStep === 3 ? (
                <>
                  <Button
                    className="hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 border border-gray-400 bg-transparent px-6 font-semibold text-black hover:text-white"
                    onClick={handleSaveAndAddAnother}
                    disabled={isDocumentUploading}
                  >
                    Save & Add Another
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6"
                    onClick={handleNext}
                    disabled={isDocumentUploading}
                  >
                    {isDocumentUploading ? 'Uploading...' : 'Update Property'}
                    <MoveRight className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="hover:bg-secondary flex h-11 w-[200px] cursor-pointer items-center gap-2 border border-gray-400 bg-transparent px-6 font-semibold text-black hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onArchiveClick && property) {
                        onArchiveClick(property)
                      }
                    }}
                  >
                    Archive Property
                    <Trash className="size-4" />
                  </Button>
                  <Button
                    className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {currentStep === 2 && isLoading ? (
                      <>Updating Property...</>
                    ) : (
                      <>
                        Next
                        <MoveRight className="size-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Duplicates List Modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col space-y-4 rounded-lg border border-gray-400 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-lg bg-[#F2F2F2] px-4 py-4">
              <h2 className="text-secondary text-lg font-semibold">
                Duplicate Properties Created ({createdDuplicates.length})
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-5 w-5 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                onClick={() => setShowDuplicatesModal(false)}
              >
                <X className="h-4 w-4 font-bold" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4">
              <div className="space-y-3">
                {createdDuplicates.map((duplicate, index) => (
                  <div
                    key={duplicate.id}
                    className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-4"
                  >
                    <div className="flex flex-col">
                      <h3 className="text-secondary font-semibold">
                        {duplicate.name}
                      </h3>
                    </div>
                    <Button
                      className="text-secondary/50 hover:text-primary cursor-pointer bg-transparent hover:bg-transparent"
                      onClick={() => {
                        const duplicateProperty = {
                          ...formData,
                          id: duplicate.id.toString(),
                          name: duplicate.name,
                        }
                        if (setSelectedProperty) {
                          setSelectedProperty(duplicateProperty as Properties)
                        }
                        setShowDuplicatesModal(false)
                        setCurrentStep(1)
                        setIsSubmitted(false)
                        setIsDuplicateEnabled(false)
                        setDuplicateCount('')
                        setDuplicateNames([])
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end rounded-b-lg bg-[#F2F2F2] px-4 py-3">
              <Button
                className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6"
                onClick={() => {
                  setShowDuplicatesModal(false)
                }}
              >
                Save
                <MoveRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertiesEditModel