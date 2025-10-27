import { useCallback, useEffect, useRef, useState } from 'react'
import { geocodingService, AddressComponents, GeocodeResult } from '@/services/geocodingService'

export interface UseAddressGeocodingProps {
  addressComponents: AddressComponents
  onCoordinatesFound?: (result: GeocodeResult) => void
  onError?: (error: string) => void
  debounceMs?: number
  autoTrigger?: boolean
  enabled?: boolean
}

export interface UseAddressGeocodingReturn {
  isLoading: boolean
  coordinates: GeocodeResult | null
  error: string | null
  geocodeAddress: () => Promise<void>
  clearError: () => void
  clearCoordinates: () => void
}

/**
 * Custom hook for geocoding addresses to coordinates
 */
export function useAddressGeocoding({
  addressComponents,
  onCoordinatesFound,
  onError,
  debounceMs = 1000,
  autoTrigger = true,
  enabled = true,
}: UseAddressGeocodingProps): UseAddressGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<GeocodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const currentLookupRef = useRef<string>('')

  // Check if we have enough address components to geocode
  const hasMinimumAddressData = useCallback(() => {
    const { addressLine1, locality, district, city, state, country } = addressComponents
    
    // We need at least one of: addressLine1, city, or (locality + state)
    return !!(
      addressLine1?.trim() ||
      city?.trim() ||
      (locality?.trim() && state?.trim()) ||
      (district?.trim() && state?.trim())
    )
  }, [addressComponents])

  const performGeocoding = useCallback(async () => {
    if (!enabled || !hasMinimumAddressData()) {
      return
    }

    const lookupId = `${Date.now()}-${Math.random()}`
    currentLookupRef.current = lookupId

    setIsLoading(true)
    setError(null)

    try {
      const result = await geocodingService.geocodeAddress(addressComponents)

      // Check if this is still the current lookup request
      if (currentLookupRef.current !== lookupId) {
        return // Ignore outdated requests
      }

      if (result.success && result.data) {
        setCoordinates(result.data)
        onCoordinatesFound?.(result.data)
        setError(null)
      } else {
        const errorMessage = result.error || 'Failed to geocode address'
        setError(errorMessage)
        onError?.(errorMessage)
        setCoordinates(null)
      }
    } catch (err) {
      // Check if this is still the current lookup request
      if (currentLookupRef.current !== lookupId) {
        return // Ignore outdated requests
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown geocoding error'
      setError(errorMessage)
      onError?.(errorMessage)
      setCoordinates(null)
    } finally {
      // Only update loading state if this is still the current request
      if (currentLookupRef.current === lookupId) {
        setIsLoading(false)
      }
    }
  }, [addressComponents, enabled, hasMinimumAddressData, onCoordinatesFound, onError])

  // Auto-trigger geocoding when address components change
  useEffect(() => {
    if (!autoTrigger || !enabled) return

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Only geocode if we have minimum address data
    if (hasMinimumAddressData()) {
      const timer = setTimeout(() => {
        performGeocoding()
      }, debounceMs)

      setDebounceTimer(timer)
    } else {
      // Clear coordinates if we don't have enough data
      setCoordinates(null)
      setError(null)
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [addressComponents, autoTrigger, enabled, debounceMs, hasMinimumAddressData, performGeocoding])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearCoordinates = useCallback(() => {
    setCoordinates(null)
    setError(null)
  }, [])

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
    coordinates,
    error,
    geocodeAddress: performGeocoding,
    clearError,
    clearCoordinates,
  }
}

/**
 * Simplified hook for basic address geocoding
 */
export function useSimpleAddressGeocoding(
  address: string,
  onCoordinatesFound: (latitude: number, longitude: number) => void,
  enabled: boolean = true
) {
  return useAddressGeocoding({
    addressComponents: { addressLine1: address },
    onCoordinatesFound: (result) => {
      onCoordinatesFound(result.latitude, result.longitude)
    },
    autoTrigger: true,
    enabled,
    debounceMs: 1200, // Slightly longer debounce for simpler use case
  })
}
