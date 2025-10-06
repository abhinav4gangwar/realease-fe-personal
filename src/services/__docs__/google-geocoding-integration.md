# Google Geocoding API Integration

## Overview
The location service has been updated to use Google Geocoding API as the primary service for auto-filling city and state information based on country and zipcode. This provides more accurate and reliable location data compared to the previous free services.

## Features

### 1. Google Geocoding API (Primary Service)
- **High Accuracy**: Google's comprehensive location database
- **Global Coverage**: Supports postal codes worldwide
- **Detailed Information**: Provides city, state, country, and coordinates
- **Fallback Support**: Falls back to other services if Google API fails

### 2. API Request Format
```
https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:201301|country:IN&key=API_KEY
```

### 3. Response Parsing
The service extracts location data from Google's response:
- **City**: `locality` or `administrative_area_level_2`
- **State**: `administrative_area_level_1`
- **Country**: `country` component
- **Coordinates**: `geometry.location.lat/lng`

## Configuration

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### API Key Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Geocoding API
3. Create an API key
4. Add the key to your environment variables

## Usage Example

### In Property Forms
When a user enters a zipcode and selects a country:
1. Service calls Google Geocoding API
2. Extracts city and state from response
3. Auto-fills the form fields
4. Provides coordinates for map display

### Sample Response Processing
```javascript
// Google API Response
{
  "results": [{
    "address_components": [
      {
        "long_name": "Noida",
        "types": ["locality", "political"]
      },
      {
        "long_name": "Uttar Pradesh", 
        "types": ["administrative_area_level_1", "political"]
      }
    ],
    "geometry": {
      "location": {
        "lat": 28.5821195,
        "lng": 77.3266991
      }
    }
  }]
}

// Extracted Data
{
  city: "Noida",
  state: "Uttar Pradesh", 
  country: "India",
  latitude: "28.5821195",
  longitude: "77.3266991"
}
```

## Fallback Services
If Google API fails, the service falls back to:
1. **Nominatim** (OpenStreetMap) - Free, no API key
2. **Zippopotam** - Good for US/EU postal codes
3. **PostalPincode** - Specialized for certain regions

## Error Handling
- **Missing API Key**: Falls back to other services
- **Rate Limiting**: Automatic fallback to next service
- **Invalid Postal Code**: Returns appropriate error message
- **Network Issues**: Graceful degradation to backup services

## Benefits
- **Improved Accuracy**: Google's data is more comprehensive
- **Better International Support**: Covers more countries
- **Consistent Format**: Standardized address components
- **Coordinates Included**: Enables map functionality
- **Reliable Service**: Google's infrastructure ensures uptime

## Testing
Test with various postal codes:
- **US**: 10001 (New York)
- **India**: 201301 (Noida)
- **UK**: SW1A 1AA (London)
- **Canada**: M5V 3A8 (Toronto)

The service should now provide more accurate city and state information for property creation and editing forms.
