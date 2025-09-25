'use client'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  CityType,
  CountryType,
  Properties,
  StateType,
} from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { City, Country, State } from 'country-state-city'
import { useLocationAutoFill } from '@/hooks/useLocationAutoFill'
import {
  ArrowLeft,
  AlertCircle,
  Check,
  CheckCircle,
  ChevronDown,
  Loader2,
  MapPin,
  MoveRight,
  Plus,
  PlusIcon,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileItem, PropertyUploadDropzone } from './document-upload'

interface CustomField {
  id: string
  label: string
  value: string
}

interface CreatePropertyModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreatePropertyModal = ({ isOpen, onClose }: CreatePropertyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDisputed, setIsDisputed] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    null
  )
  const [documentFiles, setDocumentFiles] = useState<FileItem[]>([])
  const [isDocumentUploading, setIsDocumentUploading] = useState(false)

  const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(
    null
  )
  const [countries, setCountries] = useState<CountryType[]>([])

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
    isDisputed: isDisputed,
    legalParties: '',
    caseNumber: '',
    caseType: '',
    nextHearing: '',
    extent: '',
    valuePerSQ: '',
    value: '',
  })

  useEffect(() => {
    // Load all countries on component mount
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      // Update form data
      updateFormData('country', selectedCountry.name)
    }
  }, [selectedCountry])

  // Track if we're currently auto-filling to prevent infinite loops
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [lastAutoFilledZipcode, setLastAutoFilledZipcode] = useState('')

  // Location auto-fill functionality
  const {
    isLoading: isLocationLoading,
    error: locationError,
    isValidZipcode,
  } = useLocationAutoFill({
    country: selectedCountry?.name || '',
    zipcode: formData.zipcode,
    onLocationFound: (location) => {
      // Prevent infinite loops by checking if we're already auto-filling
      if (isAutoFilling || lastAutoFilledZipcode === formData.zipcode) {
        return
      }

      setIsAutoFilling(true)
      setLastAutoFilledZipcode(formData.zipcode)

      console.log('🎯 Location found:', location)
      console.log('🏁 Current selected country:', selectedCountry?.name)

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

      // Use the currently selected country for state/city lookup
      const countryForLookup = selectedCountry || countries.find(c =>
        c.name.toLowerCase().includes(location.country.toLowerCase()) ||
        c.isoCode.toLowerCase() === location.countryCode.toLowerCase()
      )

      // Auto-fill state and city from location data
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

  const CountrySelect = () => {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const filteredCountries = countries.filter((country) =>
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
            {selectedCountry?.name || 'Select Country'}
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
                        'mr-2 h-4 w-4',
                        selectedCountry?.isoCode === country.isoCode
                          ? 'opacity-100'
                          : 'opacity-0'
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

  const resetForm = () => {
    setFormData({
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
      isDisputed: isDisputed,
      legalParties: '',
      caseNumber: '',
      caseType: '',
      nextHearing: '',
      extent: '',
      valuePerSQ: '',
      value: '',
    })
    setCustomFields([])
    setIsDisputed(false)
    setCurrentStep(1)
    setIsSubmitted(false)
    setCreatedPropertyId(null)
    setDocumentFiles([])
    setIsDocumentUploading(false)
  }

  const createProperty = async () => {
    try {
      setIsLoading(true)

      const additionalDetails = customFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.label]: field.value,
        }),
        {}
      )

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
        coordinates: formData.coordinates,
        isDisputed: isDisputed,
        legalStatus: isDisputed ? 'Disputed - Ongoing' : 'Undisputed',
        legalParties: formData.legalParties,
        caseNumber: formData.caseNumber,
        caseType: formData.caseType,
        nextHearing: formData.nextHearing,
        extent: formData.extent,
        valuePerSQ: formData.valuePerSQ,
        additionalDetails:
          Object.keys(additionalDetails).length > 0
            ? additionalDetails
            : undefined,
      }
      const response = await apiClient.post(
        '/dashboard/properties/create',
        requestBody
      )

      if (
        response.data &&
        response.data.properties &&
        response.data.properties.length > 0
      ) {
        setCreatedPropertyId(response.data.properties[0].id.toString())
        toast.success('Property created successfully!')
        return true
      }

      throw new Error('Invalid response format')
    } catch (error: any) {
      console.error('Property creation error:', error)
      toast.error(error.response?.data?.message || 'Failed to create property')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (documentFiles.length === 0) {
      return true
    }

    if (!createdPropertyId) {
      toast.error('Property ID not found')
      return false
    }

    try {
      setIsDocumentUploading(true)

      const formData = new FormData()
      documentFiles.forEach(({ file }) => {
        formData.append('files', file)
      })

      // Add metadata
      const metadata = documentFiles.map(({ name }) => ({
        name: name,
        path: name,
        propertyId: createdPropertyId,
        tags: '',
      }))

      formData.append('meta', JSON.stringify(metadata))
      formData.append('parentId', '')

      const response = await apiClient.post(
        '/dashboard/documents/upload',
        formData,
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

  const handleNext = async () => {
    if (currentStep === 2) {
      const success = await createProperty()
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

  const handleAddAnother = () => {
    resetForm()
  }

  const handleSaveAndAddAnother = async () => {
    if (currentStep === 3) {
      const uploadSuccess = await handleDocumentUpload()
      if (uploadSuccess) {
        toast.success('Property created successfully!')
        resetForm()
      }
    }
  }

  const renderStepForm = () => {
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-center justify-center space-y-6 p-3">
          <h1 className="text-secondary text-center text-3xl font-bold">
            Property Saved <br /> Successfully
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
              onClick={handleAddAnother}
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
              Fill in the details below to add a new property
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
            <p className="font-light">Fill in the Property details</p>

            {/* address */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Address <span className="text-primary">*</span>
              </label>
              <div className="rounded-lg border border-gray-400 p-4">
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

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      Address line 1
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData('address', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Enter details"
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

                <div className="grid grid-cols-3 gap-3 py-3">


                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">City</label>
                    <Input
                      type="text"
                      placeholder="Enter city"
                      value={formData.city || ''}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="h-14"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">District</label>
                    <Input
                      type="text"
                      placeholder="Enter district"
                      value={formData.district || ''}
                      onChange={(e) => updateFormData('district', e.target.value)}
                      className="h-14"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-md text-secondary block">
                      State
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter state"
                      value={formData.state || ''}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="h-14"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* coordinates */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Co-ordinates <span className="text-primary">*</span>
              </label>

              <div className="flex flex-col space-y-1">
                <Input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) =>
                    updateFormData('coordinates', e.target.value)
                  }
                  className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                  placeholder="Coordinates"
                />
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
                      Parties <span className="text-primary">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.legalParties}
                      onChange={(e) =>
                        updateFormData('legalParties', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                      placeholder="Parties"
                    />
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
                        Case Status <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.nextHearing}
                        onChange={(e) =>
                          updateFormData('nextHearing', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-400 bg-white px-3 py-2"
                        placeholder="Select Status"
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

            {/* {extent} */}
            <div className="flex flex-col space-y-3">
              <label className="text-md text-secondary block font-semibold">
                Extent <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                value={formData.extent}
                onChange={(e) => updateFormData('extent', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter value (acres)"
                required
              />
            </div>

            {/* value */}
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-3">
                <label className="text-md text-secondary block font-semibold">
                  Land value per acre <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.valuePerSQ}
                  onChange={(e) => updateFormData('valuePerSQ', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="00.00"
                  required
                />
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-md text-secondary block font-semibold">
                  Land value <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.value}
                  onChange={(e) => updateFormData('value', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="00.00"
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
                      Value
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
          </div>
        )

      case 3:
        return (
          <div>
            <p className="font-semibold">Upload Documents</p>
            <PropertyUploadDropzone
              propertyId={createdPropertyId}
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
                Add a New Property
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

        {/* footer */}
        {!isSubmitted && (
          <div className="flex items-center justify-between rounded-b-lg bg-[#F2F2F2] px-4 py-3">
            <div className="flex items-center gap-1">
              {/* three dots to show three steps and current step identify */}
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
                    {isDocumentUploading ? 'Uploading...' : 'Save & Next'}
                    <MoveRight className="size-4" />
                  </Button>
                </>
              ) : currentStep < 3 ? (
                <Button
                  className="bg-primary hover:bg-secondary flex h-11 cursor-pointer items-center gap-2 px-6"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {currentStep === 2 && isLoading ? (
                    <>Creating Property...</>
                  ) : (
                    <>
                      Next
                      <MoveRight className="size-4" />
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatePropertyModal
