/**
 * Test file for Google Geocoding API integration
 * Run this in browser console to test the service
 */

// Test function for Google Geocoding API
async function testGoogleGeocoding() {
  console.log('🧪 Testing Google Geocoding API Integration...')
  
  // Import the location service (adjust path as needed)
  const { locationService } = await import('../locationService.ts')
  
  // Test cases with different countries and postal codes
  const testCases = [
    { country: 'IN', zipcode: '201301', expected: { city: 'Noida', state: 'Uttar Pradesh' } },
    { country: 'US', zipcode: '10001', expected: { city: 'New York', state: 'New York' } },
    { country: 'GB', zipcode: 'SW1A 1AA', expected: { city: 'London', state: 'England' } },
    { country: 'CA', zipcode: 'M5V 3A8', expected: { city: 'Toronto', state: 'Ontario' } }
  ]
  
  console.log('📍 Running test cases...')
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔍 Testing ${testCase.country} - ${testCase.zipcode}`)
      
      const result = await locationService.lookup(testCase.country, testCase.zipcode)
      
      if (result.success && result.data) {
        console.log('✅ Success:', {
          city: result.data.city,
          state: result.data.state,
          country: result.data.country,
          coordinates: result.data.latitude && result.data.longitude 
            ? `${result.data.latitude}, ${result.data.longitude}` 
            : 'Not available'
        })
        
        // Check if results match expectations
        const cityMatch = result.data.city.toLowerCase().includes(testCase.expected.city.toLowerCase())
        const stateMatch = result.data.state.toLowerCase().includes(testCase.expected.state.toLowerCase())
        
        if (cityMatch && stateMatch) {
          console.log('🎯 Expected results matched!')
        } else {
          console.log('⚠️ Results differ from expected:', testCase.expected)
        }
      } else {
        console.log('❌ Failed:', result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('💥 Test error:', error)
    }
  }
  
  console.log('\n🏁 Google Geocoding API test completed!')
}

// Test function for manual execution
async function testSingleLocation(countryCode, zipcode) {
  console.log(`🔍 Testing single location: ${countryCode} - ${zipcode}`)
  
  try {
    const { locationService } = await import('../locationService.ts')
    const result = await locationService.lookup(countryCode, zipcode)
    
    if (result.success && result.data) {
      console.log('✅ Location found:', result.data)
      return result.data
    } else {
      console.log('❌ Location lookup failed:', result.error)
      return null
    }
  } catch (error) {
    console.error('💥 Error:', error)
    return null
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testGoogleGeocoding = testGoogleGeocoding
  window.testSingleLocation = testSingleLocation
  
  console.log('🚀 Google Geocoding test functions loaded!')
  console.log('Run testGoogleGeocoding() to test all cases')
  console.log('Run testSingleLocation("IN", "201301") to test a specific location')
}

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGoogleGeocoding,
    testSingleLocation
  }
}
