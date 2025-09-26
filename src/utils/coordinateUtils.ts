/**
 * Utility functions for handling coordinate formats
 * Supports conversion between different coordinate representations
 */

export interface Coordinates {
  latitude: string
  longitude: string
}

/**
 * Formats separate latitude and longitude strings into a display string
 * @param latitude - Latitude as string (e.g., "32.77670000")
 * @param longitude - Longitude as string (e.g., "-96.79700000")
 * @returns Formatted coordinate string (e.g., "32.7767, -96.7970")
 */
export function formatCoordinates(latitude?: string, longitude?: string): string {
  if (!latitude || !longitude) {
    return ''
  }

  try {
    // Parse and format to remove unnecessary trailing zeros
    const lat = parseFloat(latitude).toString()
    const lng = parseFloat(longitude).toString()
    return `${lat}, ${lng}`
  } catch (error) {
    // If parsing fails, return the original strings
    return `${latitude}, ${longitude}`
  }
}

/**
 * Parses a coordinate string into separate latitude and longitude
 * @param coordinateString - Combined coordinate string (e.g., "32.7767, -96.7970" or "32.7767,-96.7970")
 * @returns Object with latitude and longitude strings, or null if invalid
 */
export function parseCoordinates(coordinateString: string): Coordinates | null {
  if (!coordinateString || typeof coordinateString !== 'string') {
    return null
  }

  try {
    // Split by comma and clean up whitespace
    const parts = coordinateString.split(',').map(part => part.trim())
    
    if (parts.length !== 2) {
      return null
    }

    const [latStr, lngStr] = parts
    
    // Validate that both parts are valid numbers
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    
    if (isNaN(lat) || isNaN(lng)) {
      return null
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null
    }

    return {
      latitude: lat.toString(),
      longitude: lng.toString()
    }
  } catch (error) {
    return null
  }
}

/**
 * Validates if a coordinate string is in the correct format
 * @param coordinateString - Coordinate string to validate
 * @returns True if valid, false otherwise
 */
export function isValidCoordinateString(coordinateString: string): boolean {
  return parseCoordinates(coordinateString) !== null
}

/**
 * Formats coordinates for display with specified decimal places
 * @param latitude - Latitude as string
 * @param longitude - Longitude as string  
 * @param decimals - Number of decimal places (default: 6)
 * @returns Formatted coordinate string
 */
export function formatCoordinatesWithPrecision(
  latitude?: string, 
  longitude?: string, 
  decimals: number = 6
): string {
  if (!latitude || !longitude) {
    return ''
  }

  try {
    const lat = parseFloat(latitude).toFixed(decimals)
    const lng = parseFloat(longitude).toFixed(decimals)
    return `${lat}, ${lng}`
  } catch (error) {
    return `${latitude}, ${longitude}`
  }
}

/**
 * Creates a Google Maps URL from coordinates
 * @param latitude - Latitude as string
 * @param longitude - Longitude as string
 * @returns Google Maps URL or empty string if invalid
 */
export function createMapsUrl(latitude?: string, longitude?: string): string {
  if (!latitude || !longitude) {
    return ''
  }

  try {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      return ''
    }

    return `https://www.google.com/maps?q=${lat},${lng}`
  } catch (error) {
    return ''
  }
}

/**
 * Converts coordinates to the format expected by map libraries
 * @param latitude - Latitude as string
 * @param longitude - Longitude as string
 * @returns Object with numeric lat/lng or null if invalid
 */
export function coordinatesToMapFormat(latitude?: string, longitude?: string): { lat: number; lng: number } | null {
  if (!latitude || !longitude) {
    return null
  }

  try {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      return null
    }

    return { lat, lng }
  } catch (error) {
    return null
  }
}

/**
 * Gets coordinate display string with directional indicators
 * @param latitude - Latitude as string
 * @param longitude - Longitude as string
 * @returns Formatted string with N/S/E/W indicators
 */
export function formatCoordinatesWithDirection(latitude?: string, longitude?: string): string {
  if (!latitude || !longitude) {
    return ''
  }

  try {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      return `${latitude}, ${longitude}`
    }

    const latDir = lat >= 0 ? 'N' : 'S'
    const lngDir = lng >= 0 ? 'E' : 'W'
    
    const latAbs = Math.abs(lat).toFixed(6)
    const lngAbs = Math.abs(lng).toFixed(6)
    
    return `${latAbs}°${latDir}, ${lngAbs}°${lngDir}`
  } catch (error) {
    return `${latitude}, ${longitude}`
  }
}

/**
 * Example usage and test cases
 */
export const coordinateExamples = {
  // New backend format
  newFormat: {
    latitude: "32.77670000",
    longitude: "-96.79700000"
  },
  
  // Expected display formats
  displayFormats: {
    simple: "32.7767, -96.797",
    precise: "32.776700, -96.797000", 
    directional: "32.776700°N, 96.797000°W"
  },
  
  // Map integration
  googleMapsUrl: "https://www.google.com/maps?q=32.7767,-96.797",
  mapLibraryFormat: { lat: 32.7767, lng: -96.797 }
}
