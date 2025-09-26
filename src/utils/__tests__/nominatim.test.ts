/**
 * Test the new Nominatim-based location service
 */

import { locationService } from '../locationService'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Nominatim Location Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear cache between tests
    ;(locationService as any).cache.clear()
    ;(locationService as any).pendingRequests.clear()
  })

  it('should correctly fetch location data for Indian postal code 201304', async () => {
    // Mock Nominatim geocodejson API response for 201304 (Noida)
    const mockResponse = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            geocoding: {
              place_id: 352223949,
              postcode: "201304",
              city: "Noida",
              state: "Uttar Pradesh",
              country: "India",
              country_code: "in",
              admin: {
                level6: "Noida",
                level5: "दादरी",
                level4: "Uttar Pradesh"
              }
            }
          },
          geometry: {
            type: "Point",
            coordinates: [77.3895340, 28.5277300]
          }
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await locationService.lookupLocation('India', '201304')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      city: 'Noida', // Should pick level6 since level5 is in Hindi
      state: 'Uttar Pradesh', // Should pick level4
      country: 'India',
      countryCode: 'IN',
      latitude: '28.5277300',
      longitude: '77.3895340'
    })

    // Verify the correct API call was made
    expect(fetch).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/search?country=IN&postalcode=201304&format=geocodejson&addressdetails=1&limit=1'
    )
  })

  it('should correctly fetch location data for Delhi postal code 110007', async () => {
    // Mock Nominatim geocodejson API response for 110007 (Delhi)
    const mockResponse = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            geocoding: {
              place_id: 352222436,
              postcode: "110007",
              city: "Delhi",
              country: "India",
              country_code: "in",
              admin: {
                level6: "Civil Lines Tehsil",
                level5: "Central Delhi",
                level4: "Delhi"
              }
            }
          },
          geometry: {
            type: "Point",
            coordinates: [77.2051385, 28.6835175]
          }
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await locationService.lookupLocation('India', '110007')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      city: 'Central Delhi', // Should pick level5 since it's in English
      state: 'Delhi', // Should pick level4
      country: 'India',
      countryCode: 'IN',
      latitude: '28.6835175',
      longitude: '77.2051385'
    })
  })

  it('should handle Meerut postal code with Hindi level5', async () => {
    // Mock Nominatim geocodejson API response for 250001 (Meerut)
    const mockResponse = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            geocoding: {
              place_id: 352225159,
              postcode: "250001",
              county: "Meerut",
              state: "Uttar Pradesh",
              country: "India",
              country_code: "in",
              admin: {
                level6: "Meerut",
                level5: "मेरठ", // Hindi text
                level4: "Uttar Pradesh"
              }
            }
          },
          geometry: {
            type: "Point",
            coordinates: [77.68548215454545, 28.893294808181818]
          }
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await locationService.lookupLocation('India', '250001')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      city: 'Meerut', // Should pick level6 since level5 is in Hindi
      state: 'Uttar Pradesh', // Should pick level4
      country: 'India',
      countryCode: 'IN',
      latitude: '28.893294808181818',
      longitude: '77.68548215454545'
    })
  })

  it('should handle US postal codes correctly', async () => {
    // Mock Nominatim API response for US zipcode
    const mockResponse = [
      {
        place_id: 123456,
        lat: "34.0901",
        lon: "-118.4065",
        address: {
          postcode: "90210",
          city: "Beverly Hills",
          state: "California",
          country: "United States",
          country_code: "us"
        }
      }
    ]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await locationService.lookupLocation('United States', '90210')
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      city: 'Beverly Hills',
      state: 'California',
      country: 'United States',
      countryCode: 'US',
      latitude: '34.0901',
      longitude: '-118.4065'
    })

    // Verify the correct API call was made
    expect(fetch).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/search?country=US&postalcode=90210&format=json&addressdetails=1&limit=1'
    )
  })

  it('should handle empty responses gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]) // Empty array
    })

    const result = await locationService.lookupLocation('India', '999999')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('No location data found')
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await locationService.lookupLocation('India', '201304')
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Network error')
  })

  it('should fallback to other services if Nominatim fails', async () => {
    // Mock Nominatim failure
    ;(fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Nominatim failed'))
      // Mock Zippopotam success
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country: 'United States',
          'country abbreviation': 'US',
          places: [{
            'place name': 'Beverly Hills',
            state: 'California',
            latitude: '34.0901',
            longitude: '-118.4065'
          }]
        })
      })

    const result = await locationService.lookupLocation('United States', '90210')
    
    expect(result.success).toBe(true)
    expect(result.data?.city).toBe('Beverly Hills')
    expect(result.data?.state).toBe('California')
    
    // Should have tried both services
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle missing address fields gracefully', async () => {
    // Mock response with minimal address data
    const mockResponse = [
      {
        place_id: 123456,
        lat: "28.5277300",
        lon: "77.3895340",
        address: {
          postcode: "201304",
          // Missing city and state
          country: "India",
          country_code: "in"
        }
      }
    ]

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await locationService.lookupLocation('India', '201304')
    
    expect(result.success).toBe(true)
    expect(result.data?.city).toBe('Unknown') // Fallback value
    expect(result.data?.state).toBe('Unknown') // Fallback value
    expect(result.data?.country).toBe('India')
  })
})
