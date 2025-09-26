/**
 * Demo showing how the new Nominatim geocodejson API works
 * This demonstrates the admin level extraction logic
 */

// Example API responses and expected results:

// 1. Delhi (110007) - level5 is in English
const delhiResponse = {
  "features": [{
    "properties": {
      "geocoding": {
        "postcode": "110007",
        "city": "Delhi",
        "country": "India",
        "country_code": "in",
        "admin": {
          "level6": "Civil Lines Tehsil",
          "level5": "Central Delhi",  // English - should be picked
          "level4": "Delhi"           // State
        }
      }
    },
    "geometry": {
      "coordinates": [77.20513854285714, 28.68351752967033]
    }
  }]
}
// Expected result: city = "Central Delhi", state = "Delhi"

// 2. Meerut (250001) - level5 and level6 are same
const meerutResponse = {
  "features": [{
    "properties": {
      "geocoding": {
        "postcode": "250001",
        "county": "Meerut",
        "state": "Uttar Pradesh",
        "country": "India",
        "country_code": "in",
        "admin": {
          "level6": "Meerut",         // Should be picked
          "level5": "Meerut",         // Same as level6
          "level4": "Uttar Pradesh"   // State
        }
      }
    },
    "geometry": {
      "coordinates": [77.68548215454545, 28.893294808181818]
    }
  }]
}
// Expected result: city = "Meerut", state = "Uttar Pradesh"

// 3. Noida (201304) - has level8 (most specific)
const noidaResponse = {
  "features": [{
    "properties": {
      "geocoding": {
        "postcode": "201304",
        "district": "Noida",
        "city": "Dadri",
        "county": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "country": "India",
        "country_code": "in",
        "admin": {
          "level8": "Noida",              // Most specific - should be picked
          "level6": "Dadri",
          "level5": "Gautam Buddha Nagar",
          "level4": "Uttar Pradesh"       // State
        }
      }
    },
    "geometry": {
      "coordinates": [77.38953397857142, 28.527730025]
    }
  }]
}
// Expected result: city = "Noida", state = "Uttar Pradesh"

// 4. Mumbai (400001) - typical structure
const mumbaiResponse = {
  "features": [{
    "properties": {
      "geocoding": {
        "postcode": "400001",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "country_code": "in",
        "admin": {
          "level6": "F/S Ward",
          "level5": "Zone 2",           // English - should be picked
          "level4": "Maharashtra"       // State
        }
      }
    },
    "geometry": {
      "coordinates": [72.8311, 18.9388]
    }
  }]
}
// Expected result: city = "Zone 2", state = "Maharashtra"

// 5. Hyderabad (500001) - complex structure
const hyderabadResponse = {
  "features": [{
    "properties": {
      "geocoding": {
        "postcode": "500001",
        "city": "Hyderabad",
        "county": "Nampally mandal",
        "state": "Telangana",
        "country": "India",
        "country_code": "in",
        "admin": {
          "level6": "Ward 78 Gunfoundry",
          "level5": "Greater Hyderabad Municipal Corporation Central Zone", // Long English name
          "level4": "Telangana"         // State
        }
      }
    },
    "geometry": {
      "coordinates": [78.4744, 17.3753]
    }
  }]
}
// Expected result: city = "Ward 78 Gunfoundry", state = "Telangana"

/**
 * City extraction logic:
 * 
 * 1. level8 (if exists) - Most specific administrative level
 * 2. level6 (if exists) - District/Ward level
 * 3. level5 (if in English) - Check if contains only ASCII characters
 * 4. city property - Direct city field
 * 5. district property - District field
 * 6. county property - County field
 * 7. "Unknown" - Final fallback
 * 
 * State extraction:
 * - Always use admin.level4 (most reliable for state)
 * - Fallback to geocoding.state
 * - Final fallback to "Unknown"
 */

export const testCases = [
  {
    name: "Delhi 110007",
    response: delhiResponse,
    expected: { city: "Central Delhi", state: "Delhi" }
  },
  {
    name: "Meerut 250001", 
    response: meerutResponse,
    expected: { city: "Meerut", state: "Uttar Pradesh" }
  },
  {
    name: "Noida 201304",
    response: noidaResponse,
    expected: { city: "Noida", state: "Uttar Pradesh" }
  },
  {
    name: "Mumbai 400001",
    response: mumbaiResponse,
    expected: { city: "Zone 2", state: "Maharashtra" }
  },
  {
    name: "Hyderabad 500001",
    response: hyderabadResponse,
    expected: { city: "Ward 78 Gunfoundry", state: "Telangana" }
  }
]

/**
 * API URL format:
 * https://nominatim.openstreetmap.org/search?country=IN&postalcode={PINCODE}&format=geocodejson&addressdetails=1&limit=1
 * 
 * Benefits of geocodejson format:
 * 1. Consistent admin level structure
 * 2. Reliable coordinates in geometry.coordinates array
 * 3. Better handling of multilingual data
 * 4. More predictable response format
 */
