/**
 * Location Service for auto-filling city and state based on country and zipcode
 * Supports multiple APIs with fallback mechanisms
 */

import { indianPincodeService } from './indianPincodeService'

export interface LocationData {
  city: string
  state: string
  country: string
  countryCode: string
  latitude?: string
  longitude?: string
}

export interface LocationServiceResponse {
  success: boolean
  data?: LocationData
  error?: string
}

/**
 * Google Geocoding API - Primary service with high accuracy
 * Requires API key from environment variables
 */
class GoogleGeocodingService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Maps API key not found in environment variables')
    }
  }

  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      }
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${zipcode}|country:${countryCode.toUpperCase()}&key=${this.apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0]
        const addressComponents = result.address_components || []
        const geometry = result.geometry || {}
        const location = geometry.location || {}

        // Extract city, state, and country from address components
        let city = ''
        let state = ''
        let country = ''
        let extractedCountryCode = ''

        for (const component of addressComponents) {
          const types = component.types || []

          // City - look for locality first, then administrative_area_level_2
          if (types.includes('locality')) {
            city = component.long_name
          } else if (!city && types.includes('administrative_area_level_2')) {
            city = component.long_name
          }

          // State - administrative_area_level_1
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name
          }

          // Country
          if (types.includes('country')) {
            country = component.long_name
            extractedCountryCode = component.short_name
          }
        }

        // If no city found in locality, try postcode_localities
        if (!city && result.postcode_localities && result.postcode_localities.length > 0) {
          city = result.postcode_localities[0]
        }

        return {
          success: true,
          data: {
            city: city || 'Unknown',
            state: state || 'Unknown',
            country: country || 'Unknown',
            countryCode: extractedCountryCode || countryCode,
            latitude: location.lat ? location.lat.toString() : undefined,
            longitude: location.lng ? location.lng.toString() : undefined,
          }
        }
      } else {
        return {
          success: false,
          error: data.status === 'ZERO_RESULTS' ? 'No results found for this postal code' : `Google API error: ${data.status}`
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
}

/**
 * Nominatim OpenStreetMap API - Free, no API key required
 * Uses geocodejson format for consistent admin level handling
 */
class NominatimService {
  private baseUrl = 'https://nominatim.openstreetmap.org'

  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    try {
      const url = `${this.baseUrl}/search?country=${countryCode.toUpperCase()}&postalcode=${zipcode}&format=geocodejson&addressdetails=1&limit=1`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0]
        const geocoding = feature.properties?.geocoding || {}
        const admin = geocoding.admin || {}
        const coordinates = feature.geometry?.coordinates || []

        // Extract city and state using admin levels
        const city = this.extractCity(geocoding, admin)
        const state = admin.level4 || geocoding.state || 'Unknown'

        return {
          success: true,
          data: {
            city,
            state,
            country: geocoding.country || 'Unknown',
            countryCode: geocoding.country_code?.toUpperCase() || countryCode.toUpperCase(),
            latitude: coordinates[1]?.toString(),
            longitude: coordinates[0]?.toString(),
          }
        }
      }

      return {
        success: false,
        error: 'No location data found'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Extract city name from geocoding data using admin levels and properties
   * Priority:
   * 1. level8 (most specific, like "Noida")
   * 2. level6 (district level)
   * 3. level5 (if in English)
   * 4. city property
   * 5. district property
   * 6. county property
   */
  private extractCity(geocoding: any, admin: any): string {
    // First check level8 (most specific administrative level)
    if (admin.level8) {
      return admin.level8
    }

    // Check level6 (district level)
    if (admin.level6) {
      return admin.level6
    }

    // Check if level5 exists and is in English (contains only ASCII characters)
    if (admin.level5) {
      const isEnglish = /^[a-zA-Z\s\-'\.]+$/.test(admin.level5)
      if (isEnglish) {
        return admin.level5
      }
    }

    // Fallback to direct properties
    if (geocoding.city) {
      return geocoding.city
    }

    if (geocoding.district) {
      return geocoding.district
    }

    if (geocoding.county) {
      return geocoding.county
    }

    return 'Unknown'
  }
}

/**
 * Zippopotam.us API - Free, no API key required
 * Supports: US, CA, DE, FR, IT, ES, PT, NL, BE, AT, CH, LU, and more
 */
class ZippopotamService {
  private baseUrl = 'https://api.zippopotam.us'

  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${countryCode.toLowerCase()}/${zipcode}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.places && data.places.length > 0) {
        const firstPlace = data.places[0]

        return {
          success: true,
          data: {
            city: firstPlace['place name'],
            state: firstPlace.state,
            country: data.country,
            countryCode: data['country abbreviation'],
            latitude: firstPlace.latitude,
            longitude: firstPlace.longitude,
          }
        }
      }

      return {
        success: false,
        error: 'No location data found'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * PostalPincode API - Alternative free service
 * Good for international coverage
 */
class PostalPincodeService {
  private baseUrl = 'https://api.postalpincode.in'

  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    try {
      // This API has different endpoints for different countries
      let url = ''
      
      if (countryCode.toLowerCase() === 'in') {
        url = `${this.baseUrl}/pincode/${zipcode}`
      } else {
        // For other countries, we'll skip this service
        throw new Error('Country not supported by this service')
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
        const place = data.PostOffice[0]

        return {
          success: true,
          data: {
            city: place.District,
            state: place.State,
            country: 'India',
            countryCode: 'IN',
          }
        }
      }

      return {
        success: false,
        error: 'No location data found'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * GeoJSON Indian Pincode Service
 * Uses local GeoJSON data where division=district and circle=state
 */
class GeoJSONIndianPincodeService {
  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    if (countryCode.toLowerCase() !== 'in') {
      throw new Error('This service only supports India')
    }

    try {
      console.log(`🗺️ GeoJSON service: Looking up Indian pincode ${zipcode}`)
      const result = await indianPincodeService.findByPincode(zipcode)

      if (result) {
        console.log(`✅ GeoJSON service: Found data for ${zipcode}:`, result)
        return {
          success: true,
          data: {
            city: result.district,     // Use district as city
            state: result.state,       // Circle maps to state
            country: 'India',
            countryCode: 'IN',
            latitude: result.coordinates?.[0].toString(),
            longitude: result.coordinates?.[1].toString(),
          }
        }
      }

      console.log(`❌ GeoJSON service: Pincode ${zipcode} not found in local data`)
      return {
        success: false,
        error: 'Pincode not found in GeoJSON data'
      }
    } catch (error) {
      console.error(`💥 GeoJSON service error for ${zipcode}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Enhanced Indian Postal Service for API-based pincode data
 * Handles the structure where division=district and circle=state
 */
class EnhancedIndianPostalService {
  private baseUrl = 'https://api.postalpincode.in'

  async lookup(countryCode: string, zipcode: string): Promise<LocationServiceResponse> {
    if (countryCode.toLowerCase() !== 'in') {
      throw new Error('This service only supports India')
    }

    try {
      const url = `${this.baseUrl}/pincode/${zipcode}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
        const place = data.PostOffice[0]

        // Map according to user's specification:
        // division = district, circle = state
        return {
          success: true,
          data: {
            city: place.District || place.Division || 'Unknown', // Use Division as fallback for district
            state: place.State || place.Circle || 'Unknown',     // Use Circle as fallback for state
            country: 'India',
            countryCode: 'IN',
          }
        }
      }

      return {
        success: false,
        error: 'No location data found for this pincode'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Main Location Service with fallback mechanism
 */
export class LocationService {
  private services: Array<{ name: string; service: GoogleGeocodingService | NominatimService | ZippopotamService | PostalPincodeService | EnhancedIndianPostalService | GeoJSONIndianPincodeService }> = [
    { name: 'Google Geocoding', service: new GoogleGeocodingService() },
    { name: 'GeoJSON Indian Pincode', service: new GeoJSONIndianPincodeService() },
    { name: 'Enhanced Indian Postal', service: new EnhancedIndianPostalService() },
    { name: 'Nominatim', service: new NominatimService() },
    { name: 'Zippopotam', service: new ZippopotamService() },
    { name: 'PostalPincode', service: new PostalPincodeService() },
  ]

  // Simple cache to prevent duplicate requests
  private cache = new Map<string, LocationServiceResponse>()
  private pendingRequests = new Map<string, Promise<LocationServiceResponse>>()

  /**
   * Get country code from country name
   */
  private getCountryCode(country: string): string {
    const countryMap: Record<string, string> = {
      // Primary countries
      'united states': 'us',
      'united states of america': 'us',
      'usa': 'us',
      'america': 'us',
      'canada': 'ca',
      'india': 'in',
      'republic of india': 'in',
      'germany': 'de',
      'deutschland': 'de',
      'france': 'fr',
      'italy': 'it',
      'spain': 'es',
      'portugal': 'pt',
      'netherlands': 'nl',
      'holland': 'nl',
      'belgium': 'be',
      'austria': 'at',
      'switzerland': 'ch',
      'luxembourg': 'lu',
      'united kingdom': 'gb',
      'uk': 'gb',
      'britain': 'gb',
      'great britain': 'gb',
      'england': 'gb',
      'scotland': 'gb',
      'wales': 'gb',
      'northern ireland': 'gb',

      // Additional countries
      'australia': 'au',
      'new zealand': 'nz',
      'japan': 'jp',
      'south korea': 'kr',
      'china': 'cn',
      'brazil': 'br',
      'mexico': 'mx',
      'argentina': 'ar',
      'chile': 'cl',
      'colombia': 'co',
      'peru': 'pe',
      'venezuela': 've',
      'south africa': 'za',
      'egypt': 'eg',
      'nigeria': 'ng',
      'kenya': 'ke',
      'morocco': 'ma',
      'turkey': 'tr',
      'russia': 'ru',
      'poland': 'pl',
      'czech republic': 'cz',
      'hungary': 'hu',
      'romania': 'ro',
      'bulgaria': 'bg',
      'croatia': 'hr',
      'serbia': 'rs',
      'slovenia': 'si',
      'slovakia': 'sk',
      'norway': 'no',
      'sweden': 'se',
      'denmark': 'dk',
      'finland': 'fi',
      'iceland': 'is',
      'ireland': 'ie',
      'malta': 'mt',
      'cyprus': 'cy',
      'greece': 'gr',
      'israel': 'il',
      'lebanon': 'lb',
      'jordan': 'jo',
      'saudi arabia': 'sa',
      'united arab emirates': 'ae',
      'uae': 'ae',
      'qatar': 'qa',
      'kuwait': 'kw',
      'bahrain': 'bh',
      'oman': 'om',
      'iran': 'ir',
      'iraq': 'iq',
      'afghanistan': 'af',
      'pakistan': 'pk',
      'bangladesh': 'bd',
      'sri lanka': 'lk',
      'nepal': 'np',
      'bhutan': 'bt',
      'myanmar': 'mm',
      'thailand': 'th',
      'vietnam': 'vn',
      'cambodia': 'kh',
      'laos': 'la',
      'malaysia': 'my',
      'singapore': 'sg',
      'indonesia': 'id',
      'philippines': 'ph',
      'taiwan': 'tw',
      'hong kong': 'hk',
      'macau': 'mo',
      'mongolia': 'mn',
      'kazakhstan': 'kz',
      'uzbekistan': 'uz',
      'kyrgyzstan': 'kg',
      'tajikistan': 'tj',
      'turkmenistan': 'tm',
      'azerbaijan': 'az',
      'armenia': 'am',
      'georgia': 'ge',
      'ukraine': 'ua',
      'belarus': 'by',
      'moldova': 'md',
      'lithuania': 'lt',
      'latvia': 'lv',
      'estonia': 'ee',
    }

    const normalizedCountry = country.toLowerCase().trim()
    const mappedCode = countryMap[normalizedCountry]

    if (mappedCode) {
      return mappedCode
    }

    // If no direct mapping found, try to extract a reasonable code
    // This prevents weird mappings like "british indian ocean territory"
    if (normalizedCountry.length === 2) {
      return normalizedCountry // Already a country code
    }

    // For unmapped countries, return the first two letters as a fallback
    // This is safer than returning the full name
    return normalizedCountry.substring(0, 2)
  }

  /**
   * Lookup location data by country and zipcode
   */
  async lookupLocation(country: string, zipcode: string): Promise<LocationServiceResponse> {
    if (!country || !zipcode) {
      return {
        success: false,
        error: 'Country and zipcode are required'
      }
    }

    const countryCode = this.getCountryCode(country)
    const cacheKey = `${countryCode}-${zipcode}`

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Cache hit for ${cacheKey}`)
      return this.cache.get(cacheKey)!
    }

    // Check if there's already a pending request for this lookup
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Waiting for pending request ${cacheKey}`)
      return await this.pendingRequests.get(cacheKey)!
    }

    // Create new request
    const requestPromise = this.performLookup(countryCode, zipcode, cacheKey)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise

      // Cache successful results for 5 minutes
      if (result.success) {
        this.cache.set(cacheKey, result)
        setTimeout(() => {
          this.cache.delete(cacheKey)
        }, 5 * 60 * 1000) // 5 minutes
      }

      return result
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Perform the actual lookup with all services
   */
  private async performLookup(countryCode: string, zipcode: string, cacheKey: string): Promise<LocationServiceResponse> {
    // For Indian pincodes, ONLY use local GeoJSON service - DO NOT call external APIs
    if (countryCode.toLowerCase() === 'in') {
      console.log(`🇮🇳 Using ONLY local GeoJSON service for Indian pincode: ${zipcode}`)
      const geoJsonService = this.services.find(s => s.name === 'GeoJSON Indian Pincode')

      if (geoJsonService) {
        try {
          console.log(`📍 Looking up Indian pincode ${zipcode} in local GeoJSON data`)
          const result = await geoJsonService.service.lookup(countryCode, zipcode)

          if (result.success) {
            console.log(`✅ GeoJSON service succeeded for ${zipcode}:`, result.data)
            return result
          } else {
            console.log(`❌ GeoJSON service failed for ${zipcode}:`, result.error)
            return {
              success: false,
              error: `Pincode ${zipcode} not found in local Indian pincode database`
            }
          }
        } catch (error) {
          console.error(`💥 GeoJSON service error for ${zipcode}:`, error)
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to lookup Indian pincode'
          }
        }
      }

      return {
        success: false,
        error: 'GeoJSON Indian Pincode service not available'
      }
    }

    // For non-Indian countries, use all services with fallback
    const servicesToTry = this.services.filter(s => s.name !== 'GeoJSON Indian Pincode')

    // Try each service in order until one succeeds
    for (const { name, service } of servicesToTry) {
      try {
        console.log(`Trying ${name} service for ${cacheKey}`)
        const result = await service.lookup(countryCode, zipcode)

        if (result.success) {
          console.log(`✅ ${name} service succeeded:`, result.data)
          return result
        } else {
          console.log(`❌ ${name} service failed:`, result.error)
        }
      } catch (error) {
        console.log(`❌ ${name} service error:`, error)
        continue
      }
    }

    return {
      success: false,
      error: 'All location services failed to find data for this zipcode'
    }
  }

  /**
   * Validate zipcode format based on country
   * Now more flexible - zipcode is optional for most countries including India
   */
  validateZipcode(country: string, zipcode: string): boolean {
    // If zipcode is empty, it's valid (non-mandatory)
    if (!zipcode || zipcode.trim().length === 0) {
      return true
    }

    const countryCode = this.getCountryCode(country)

    const patterns: Record<string, RegExp> = {
      'us': /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
      'ca': /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, // A1A 1A1 or A1A1A1
      'in': /^\d{6}$/, // 123456 (Indian pincode - but now optional)
      'de': /^\d{5}$/, // 12345
      'fr': /^\d{5}$/, // 12345
      'gb': /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/, // SW1A 1AA
    }

    const pattern = patterns[countryCode]
    if (!pattern) {
      // If no specific pattern, just check it's reasonable (alphanumeric)
      return /^[A-Za-z0-9\s\-]{1,20}$/.test(zipcode.trim())
    }

    return pattern.test(zipcode.trim())
  }

  /**
   * Check if zipcode is required for a country
   * Most countries now have optional zipcodes
   */
  isZipcodeRequired(country: string): boolean {
    const countryCode = this.getCountryCode(country)

    // Only a few countries strictly require zipcodes
    const requiredZipcodeCountries = ['us', 'ca', 'de', 'fr', 'gb']

    return requiredZipcodeCountries.includes(countryCode)
  }
}

// Export singleton instance
export const locationService = new LocationService()
