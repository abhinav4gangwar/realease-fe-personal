/**
 * Geocoding Service for converting addresses to coordinates
 * Uses Google Maps Geocoding API
 */

export interface AddressComponents {
  addressLine1?: string
  locality?: string
  district?: string
  city?: string
  state?: string
  country?: string
  zipcode?: string
}

export interface GeocodeResult {
  latitude: number
  longitude: number
  formattedAddress: string
}

export interface GeocodeResponse {
  success: boolean
  data?: GeocodeResult
  error?: string
}

/**
 * Google Geocoding Service for address-to-coordinates conversion
 */
class GoogleAddressGeocodingService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Maps API key not found in environment variables')
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(addressComponents: AddressComponents): Promise<GeocodeResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      }
    }

    // Build address string from components
    const addressParts: string[] = []
    
    if (addressComponents.addressLine1) {
      addressParts.push(addressComponents.addressLine1)
    }
    if (addressComponents.locality) {
      addressParts.push(addressComponents.locality)
    }
    if (addressComponents.district) {
      addressParts.push(addressComponents.district)
    }
    if (addressComponents.city) {
      addressParts.push(addressComponents.city)
    }
    if (addressComponents.state) {
      addressParts.push(addressComponents.state)
    }
    if (addressComponents.zipcode) {
      addressParts.push(addressComponents.zipcode)
    }
    if (addressComponents.country) {
      addressParts.push(addressComponents.country)
    }

    const address = addressParts.join(', ')
    
    if (!address.trim()) {
      return {
        success: false,
        error: 'No address components provided'
      }
    }

    try {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0]
        const geometry = result.geometry || {}
        const location = geometry.location || {}

        if (location.lat && location.lng) {
          return {
            success: true,
            data: {
              latitude: location.lat,
              longitude: location.lng,
              formattedAddress: result.formatted_address || address
            }
          }
        } else {
          return {
            success: false,
            error: 'No coordinates found in response'
          }
        }
      } else {
        return {
          success: false,
          error: data.status === 'ZERO_RESULTS' 
            ? 'No results found for this address' 
            : `Google API error: ${data.status}`
        }
      }
    } catch (error) {
      console.error('Google Geocoding API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Geocode a simple address string
   */
  async geocodeSimpleAddress(address: string): Promise<GeocodeResponse> {
    return this.geocodeAddress({ addressLine1: address })
  }
}

/**
 * Main geocoding service with caching and rate limiting
 */
class GeocodingService {
  private googleService: GoogleAddressGeocodingService
  private cache = new Map<string, GeocodeResponse>()
  private pendingRequests = new Map<string, Promise<GeocodeResponse>>()

  constructor() {
    this.googleService = new GoogleAddressGeocodingService()
  }

  /**
   * Geocode address components to coordinates
   */
  async geocodeAddress(addressComponents: AddressComponents): Promise<GeocodeResponse> {
    // Create cache key from address components
    const cacheKey = this.createCacheKey(addressComponents)
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Geocoding cache hit for ${cacheKey}`)
      return this.cache.get(cacheKey)!
    }

    // Check if there's already a pending request
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Waiting for pending geocoding request ${cacheKey}`)
      return await this.pendingRequests.get(cacheKey)!
    }

    // Create new request
    const requestPromise = this.googleService.geocodeAddress(addressComponents)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful results for 10 minutes
      if (result.success) {
        this.cache.set(cacheKey, result)
        setTimeout(() => {
          this.cache.delete(cacheKey)
        }, 10 * 60 * 1000) // 10 minutes
      }

      return result
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Create cache key from address components
   */
  private createCacheKey(addressComponents: AddressComponents): string {
    const parts = [
      addressComponents.addressLine1,
      addressComponents.locality,
      addressComponents.district,
      addressComponents.city,
      addressComponents.state,
      addressComponents.country,
      addressComponents.zipcode
    ].filter(Boolean)
    
    return parts.join('|').toLowerCase()
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService()
