/**
 * Test coordinate utility functions
 */

import {
  formatCoordinates,
  parseCoordinates,
  isValidCoordinateString,
  formatCoordinatesWithPrecision,
  createMapsUrl,
  coordinatesToMapFormat,
  formatCoordinatesWithDirection
} from '../coordinateUtils'

describe('Coordinate Utilities', () => {
  describe('formatCoordinates', () => {
    it('should format separate latitude and longitude strings', () => {
      expect(formatCoordinates('32.77670000', '-96.79700000')).toBe('32.7767, -96.797')
      expect(formatCoordinates('28.5277300', '77.3895340')).toBe('28.52773, 77.389534')
    })

    it('should handle missing coordinates', () => {
      expect(formatCoordinates('', '')).toBe('')
      expect(formatCoordinates(undefined, undefined)).toBe('')
      expect(formatCoordinates('32.7767', '')).toBe('')
    })

    it('should handle invalid coordinates gracefully', () => {
      expect(formatCoordinates('invalid', 'invalid')).toBe('invalid, invalid')
    })
  })

  describe('parseCoordinates', () => {
    it('should parse valid coordinate strings', () => {
      expect(parseCoordinates('32.7767, -96.797')).toEqual({
        latitude: '32.7767',
        longitude: '-96.797'
      })

      expect(parseCoordinates('32.7767,-96.797')).toEqual({
        latitude: '32.7767',
        longitude: '-96.797'
      })

      expect(parseCoordinates('  32.7767  ,  -96.797  ')).toEqual({
        latitude: '32.7767',
        longitude: '-96.797'
      })
    })

    it('should return null for invalid coordinate strings', () => {
      expect(parseCoordinates('')).toBeNull()
      expect(parseCoordinates('invalid')).toBeNull()
      expect(parseCoordinates('32.7767')).toBeNull()
      expect(parseCoordinates('32.7767, invalid')).toBeNull()
      expect(parseCoordinates('200, -96.797')).toBeNull() // Invalid latitude
      expect(parseCoordinates('32.7767, -200')).toBeNull() // Invalid longitude
    })
  })

  describe('isValidCoordinateString', () => {
    it('should validate coordinate strings correctly', () => {
      expect(isValidCoordinateString('32.7767, -96.797')).toBe(true)
      expect(isValidCoordinateString('0, 0')).toBe(true)
      expect(isValidCoordinateString('90, 180')).toBe(true)
      expect(isValidCoordinateString('-90, -180')).toBe(true)
      
      expect(isValidCoordinateString('')).toBe(false)
      expect(isValidCoordinateString('invalid')).toBe(false)
      expect(isValidCoordinateString('91, 0')).toBe(false) // Invalid latitude
      expect(isValidCoordinateString('0, 181')).toBe(false) // Invalid longitude
    })
  })

  describe('formatCoordinatesWithPrecision', () => {
    it('should format coordinates with specified precision', () => {
      expect(formatCoordinatesWithPrecision('32.77670000', '-96.79700000', 2))
        .toBe('32.78, -96.80')
      
      expect(formatCoordinatesWithPrecision('32.77670000', '-96.79700000', 4))
        .toBe('32.7767, -96.7970')
    })
  })

  describe('createMapsUrl', () => {
    it('should create valid Google Maps URLs', () => {
      expect(createMapsUrl('32.7767', '-96.797'))
        .toBe('https://www.google.com/maps?q=32.7767,-96.797')
      
      expect(createMapsUrl('', '')).toBe('')
      expect(createMapsUrl('invalid', 'invalid')).toBe('')
    })
  })

  describe('coordinatesToMapFormat', () => {
    it('should convert to map library format', () => {
      expect(coordinatesToMapFormat('32.7767', '-96.797')).toEqual({
        lat: 32.7767,
        lng: -96.797
      })
      
      expect(coordinatesToMapFormat('', '')).toBeNull()
      expect(coordinatesToMapFormat('invalid', 'invalid')).toBeNull()
    })
  })

  describe('formatCoordinatesWithDirection', () => {
    it('should format coordinates with directional indicators', () => {
      expect(formatCoordinatesWithDirection('32.7767', '-96.797'))
        .toBe('32.776700°N, 96.797000°W')
      
      expect(formatCoordinatesWithDirection('-32.7767', '96.797'))
        .toBe('32.776700°S, 96.797000°E')
    })
  })

  describe('Real-world coordinate examples', () => {
    it('should handle Dallas, TX coordinates', () => {
      const lat = '32.77670000'
      const lng = '-96.79700000'
      
      const formatted = formatCoordinates(lat, lng)
      expect(formatted).toBe('32.7767, -96.797')
      
      const parsed = parseCoordinates(formatted)
      expect(parsed).toEqual({
        latitude: '32.7767',
        longitude: '-96.797'
      })
      
      const mapsUrl = createMapsUrl(lat, lng)
      expect(mapsUrl).toBe('https://www.google.com/maps?q=32.7767,-96.797')
    })

    it('should handle Noida, India coordinates', () => {
      const lat = '28.5277300'
      const lng = '77.3895340'
      
      const formatted = formatCoordinates(lat, lng)
      expect(formatted).toBe('28.52773, 77.389534')
      
      const directional = formatCoordinatesWithDirection(lat, lng)
      expect(directional).toBe('28.527730°N, 77.389534°E')
    })

    it('should handle coordinate conversion workflow', () => {
      // Simulate backend response with separate lat/lng
      const backendResponse = {
        latitude: '32.77670000',
        longitude: '-96.79700000'
      }
      
      // Convert to display format
      const displayCoordinates = formatCoordinates(
        backendResponse.latitude, 
        backendResponse.longitude
      )
      expect(displayCoordinates).toBe('32.7767, -96.797')
      
      // Parse for sending back to backend
      const parsedForBackend = parseCoordinates(displayCoordinates)
      expect(parsedForBackend).toEqual({
        latitude: '32.7767',
        longitude: '-96.797'
      })
      
      // Convert for map libraries
      const mapFormat = coordinatesToMapFormat(
        backendResponse.latitude,
        backendResponse.longitude
      )
      expect(mapFormat).toEqual({
        lat: 32.7767,
        lng: -96.797
      })
    })
  })
})
