import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocationAutoFill } from '@/hooks/useLocationAutoFill'
import { AlertCircle, CheckCircle, Loader2, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface LocationInputProps {
  country: string
  zipcode: string
  city: string
  state: string
  onCountryChange: (value: string) => void
  onZipcodeChange: (value: string) => void
  onCityChange: (value: string) => void
  onStateChange: (value: string) => void
  disabled?: boolean
  autoFill?: boolean
  showValidation?: boolean
  className?: string
}

/**
 * Enhanced location input component with auto-fill functionality
 */
export function LocationInput({
  country,
  zipcode,
  city,
  state,
  onCountryChange,
  onZipcodeChange,
  onCityChange,
  onStateChange,
  disabled = false,
  autoFill = true,
  showValidation = true,
  className = '',
}: LocationInputProps) {
  const [manualOverride, setManualOverride] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    isLoading,
    locationData,
    error,
    lookupLocation,
    clearError,
    isValidZipcode,
  } = useLocationAutoFill({
    country,
    zipcode,
    onLocationFound: (location) => {
      if (!manualOverride && autoFill) {
        onCityChange(location.city)
        onStateChange(location.state)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    },
    onError: (error) => {
      console.log('Location lookup error:', error)
    },
    autoTrigger: autoFill && !manualOverride,
    debounceMs: 800,
  })

  // Reset manual override when country or zipcode changes
  useEffect(() => {
    setManualOverride(false)
    clearError()
  }, [country, zipcode, clearError])

  const handleCityChange = (value: string) => {
    setManualOverride(true)
    onCityChange(value)
    clearError()
  }

  const handleStateChange = (value: string) => {
    setManualOverride(true)
    onStateChange(value)
    clearError()
  }

  const handleManualLookup = () => {
    setManualOverride(false)
    lookupLocation()
  }

  const getZipcodeInputStatus = () => {
    if (!zipcode) return 'default'
    if (isLoading) return 'loading'
    if (error) return 'error'
    if (showSuccess || locationData) return 'success'
    if (!isValidZipcode) return 'invalid'
    return 'default'
  }

  const zipcodeStatus = getZipcodeInputStatus()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Country and Zipcode Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col space-y-1">
          <label className="text-md text-secondary block">
            Country <span className="text-primary">*</span>
          </label>
          <Input
            type="text"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Select Country"
            disabled={disabled}
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-md text-secondary block">
            Zip-code <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              value={zipcode}
              onChange={(e) => onZipcodeChange(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 pr-10 ${
                zipcodeStatus === 'error' || zipcodeStatus === 'invalid'
                  ? 'border-red-300 focus:border-red-500'
                  : zipcodeStatus === 'success'
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-300'
              }`}
              placeholder="Enter zip-code"
              disabled={disabled}
              required
            />
            
            {/* Status Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {zipcodeStatus === 'loading' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {zipcodeStatus === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {(zipcodeStatus === 'error' || zipcodeStatus === 'invalid') && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          {/* Validation Messages */}
          {showValidation && (
            <>
              {!isValidZipcode && zipcode && (
                <p className="text-xs text-red-500">
                  Invalid zipcode format for {country || 'selected country'}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500">
                  {error}
                </p>
              )}
              {showSuccess && (
                <p className="text-xs text-green-600">
                  ✓ Location found and auto-filled
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col space-y-1">
          <label className="text-md text-secondary block">City</label>
          <div className="relative">
            <Input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder={isLoading ? "Loading..." : "City"}
              disabled={disabled || isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-md text-secondary block">State</label>
          <div className="relative">
            <Input
              type="text"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder={isLoading ? "Loading..." : "State"}
              disabled={disabled || isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Lookup Button */}
      {autoFill && manualOverride && country && zipcode && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualLookup}
            disabled={disabled || isLoading || !isValidZipcode}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Auto-fill from zipcode
          </Button>
        </div>
      )}
    </div>
  )
}
