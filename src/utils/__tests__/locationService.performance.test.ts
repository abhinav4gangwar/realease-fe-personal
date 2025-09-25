/**
 * Performance and caching tests for location service
 */

import { locationService } from '../locationService'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Location Service Performance Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear cache between tests
    ;(locationService as any).cache.clear()
    ;(locationService as any).pendingRequests.clear()
  })

  it('should cache successful responses to prevent duplicate requests', async () => {
    const mockResponse = {
      country: 'India',
      places: [{ 'place name': 'Maharishi Nagar', state: 'Uttar Pradesh' }]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    // First request
    const result1 = await locationService.lookupLocation('India', '201304')
    expect(result1.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)

    // Second request should use cache
    const result2 = await locationService.lookupLocation('India', '201304')
    expect(result2.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1) // Still only 1 call
  })

  it('should handle concurrent requests for the same location', async () => {
    const mockResponse = {
      country: 'India',
      places: [{ 'place name': 'Maharishi Nagar', state: 'Uttar Pradesh' }]
    }

    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        }), 100)
      )
    )

    // Make multiple concurrent requests
    const promises = [
      locationService.lookupLocation('India', '201304'),
      locationService.lookupLocation('India', '201304'),
      locationService.lookupLocation('India', '201304')
    ]

    const results = await Promise.all(promises)

    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })

    // But only one API call should have been made
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('should properly map country names to codes', () => {
    const getCountryCode = (locationService as any).getCountryCode.bind(locationService)

    expect(getCountryCode('India')).toBe('in')
    expect(getCountryCode('INDIA')).toBe('in')
    expect(getCountryCode('Republic of India')).toBe('in')
    expect(getCountryCode('United States')).toBe('us')
    expect(getCountryCode('USA')).toBe('us')
    expect(getCountryCode('United Kingdom')).toBe('gb')
    expect(getCountryCode('UK')).toBe('gb')
    
    // Should not return weird mappings
    expect(getCountryCode('British Indian Ocean Territory')).not.toBe('british indian ocean territory')
    expect(getCountryCode('Some Unknown Country')).toBe('so') // First 2 letters as fallback
  })

  it('should validate zipcode formats correctly', () => {
    // US zipcodes
    expect(locationService.validateZipcode('United States', '90210')).toBe(true)
    expect(locationService.validateZipcode('United States', '90210-1234')).toBe(true)
    expect(locationService.validateZipcode('United States', '9021')).toBe(false)

    // Indian PIN codes
    expect(locationService.validateZipcode('India', '201304')).toBe(true)
    expect(locationService.validateZipcode('India', '20130')).toBe(false)

    // Canadian postal codes
    expect(locationService.validateZipcode('Canada', 'M5V 3L9')).toBe(true)
    expect(locationService.validateZipcode('Canada', 'M5V3L9')).toBe(true)
    expect(locationService.validateZipcode('Canada', 'M5V')).toBe(false)

    // German postal codes
    expect(locationService.validateZipcode('Germany', '10115')).toBe(true)
    expect(locationService.validateZipcode('Germany', '1011')).toBe(false)
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await locationService.lookupLocation('India', '201304')
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('All location services failed')
  })

  it('should not cache failed responses', async () => {
    ;(fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: 'India',
          places: [{ 'place name': 'Maharishi Nagar', state: 'Uttar Pradesh' }]
        })
      })

    // First request fails
    const result1 = await locationService.lookupLocation('India', '201304')
    expect(result1.success).toBe(false)

    // Second request should try again (not use cached failure)
    const result2 = await locationService.lookupLocation('India', '201304')
    expect(result2.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('Country Code Edge Cases', () => {
  it('should handle edge cases in country name mapping', () => {
    const getCountryCode = (locationService as any).getCountryCode.bind(locationService)

    // Empty/null inputs
    expect(getCountryCode('')).toBe('')
    expect(getCountryCode('  ')).toBe('')

    // Already country codes
    expect(getCountryCode('IN')).toBe('in')
    expect(getCountryCode('US')).toBe('us')

    // Long country names should be truncated safely
    expect(getCountryCode('Very Long Country Name That Does Not Exist')).toBe('ve')

    // Special characters should be handled
    expect(getCountryCode('Saint-Martin')).toBe('sa')
    expect(getCountryCode('Côte d\'Ivoire')).toBe('cô')
  })
})
