import { useCallback, useEffect, useRef, useState } from 'react'
import { locationService, LocationData } from '@/services/locationService'

export interface UseLocationAutoFillProps {
  country: string
  zipcode: string
  onLocationFound?: (location: LocationData) => void
  onError?: (error: string) => void
  debounceMs?: number
  autoTrigger?: boolean
}

export interface UseLocationAutoFillReturn {
  isLoading: boolean
  locationData: LocationData | null
  error: string | null
  lookupLocation: () => Promise<void>
  clearError: () => void
  isValidZipcode: boolean
}

/**
 * Custom hook for auto-filling city and state based on country and zipcode
 */
export function useLocationAutoFill({
  country,
  zipcode,
  onLocationFound,
  onError,
  debounceMs = 500,
  autoTrigger = true,
}: UseLocationAutoFillProps): UseLocationAutoFillReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const currentLookupRef = useRef<string>('')

  // Validate zipcode format
  const isValidZipcode = locationService.validateZipcode(country, zipcode)

  const lookupLocation = useCallback(async () => {
    if (!country || !zipcode) {
      setError('Country and zipcode are required')
      return
    }

    if (!isValidZipcode) {
      setError('Invalid zipcode format for the selected country')
      return
    }

    // Create a unique identifier for this lookup request
    const lookupId = `${country}-${zipcode}-${Date.now()}`
    currentLookupRef.current = lookupId

    setIsLoading(true)
    setError(null)

    try {
      const result = await locationService.lookupLocation(country, zipcode)

      // Check if this is still the current lookup request
      if (currentLookupRef.current !== lookupId) {
        return // Ignore outdated requests
      }

      if (result.success && result.data) {
        setLocationData(result.data)
        onLocationFound?.(result.data)
        setError(null)
      } else {
        const errorMessage = result.error || 'Failed to find location data'
        setError(errorMessage)
        onError?.(errorMessage)
        setLocationData(null)
      }
    } catch (err) {
      // Check if this is still the current lookup request
      if (currentLookupRef.current !== lookupId) {
        return // Ignore outdated requests
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      setLocationData(null)
    } finally {
      // Only update loading state if this is still the current request
      if (currentLookupRef.current === lookupId) {
        setIsLoading(false)
      }
    }
  }, [country, zipcode, isValidZipcode]) // Removed onLocationFound and onError from dependencies

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-trigger lookup when country and zipcode change (with debounce)
  useEffect(() => {
    if (!autoTrigger || !country || !zipcode || !isValidZipcode) {
      // Clear any existing data when conditions aren't met
      if (!country || !zipcode) {
        setLocationData(null)
        setError(null)
      }
      return
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Don't make requests too frequently - add minimum delay
    const now = Date.now()
    const timeSinceLastRequest = now - (currentLookupRef.current ? parseInt(currentLookupRef.current.split('-').pop() || '0') : 0)
    const minDelay = Math.max(debounceMs, 500) // Minimum 500ms between requests
    const actualDelay = timeSinceLastRequest < minDelay ? minDelay - timeSinceLastRequest : debounceMs

    // Set new timer with calculated delay
    const timer = setTimeout(() => {
      // Double-check conditions before making request
      if (autoTrigger && country && zipcode && isValidZipcode) {
        lookupLocation()
      }
    }, actualDelay)

    setDebounceTimer(timer)

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [country, zipcode, isValidZipcode, autoTrigger, debounceMs, lookupLocation])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return {
    isLoading,
    locationData,
    error,
    lookupLocation,
    clearError,
    isValidZipcode,
  }
}

/**
 * Simplified hook for basic auto-fill functionality
 */
export function useSimpleLocationAutoFill(
  country: string,
  zipcode: string,
  onLocationFound: (city: string, state: string) => void
) {
  return useLocationAutoFill({
    country,
    zipcode,
    onLocationFound: (location) => {
      onLocationFound(location.city, location.state)
    },
    autoTrigger: true,
    debounceMs: 800, // Slightly longer debounce for simpler use case
  })
}
