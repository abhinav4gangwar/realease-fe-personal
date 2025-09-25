# Location Auto-Fill Feature

This feature automatically fills city and state fields based on country and zipcode selection using third-party APIs.

## 🚀 Features

- **Automatic Location Detection**: Enter country + zipcode → get city and state automatically
- **Multiple API Support**: Uses multiple APIs with fallback mechanisms for reliability
- **Real-time Validation**: Validates zipcode format based on country
- **Visual Feedback**: Loading states, success/error indicators
- **Debounced Requests**: Prevents excessive API calls while typing
- **International Support**: Works with multiple countries worldwide

## 📦 Components & Services

### Core Services
- **`locationService.ts`** - Main service with multiple API providers
- **`useLocationAutoFill.ts`** - React hook for easy integration
- **`location-input.tsx`** - Ready-to-use input component

### API Providers
1. **Zippopotam.us** (Primary)
   - Free, no API key required
   - Supports: US, CA, DE, FR, IT, ES, PT, NL, BE, AT, CH, LU, GB
   - Format: `https://api.zippopotam.us/{country}/{zipcode}`

2. **PostalPincode** (Fallback)
   - Free for India
   - Format: `https://api.postalpincode.in/pincode/{zipcode}`

## 🛠️ Implementation

### Property Forms Integration

The feature has been integrated into:
- **Create Property Modal** (`create-property-modal.tsx`)
- **Edit Property Modal** (`properties-edit-model.tsx`)

Both forms now include:
- Enhanced zipcode input with visual status indicators
- Automatic country/state/city selection from dropdowns
- Real-time validation and error handling

### Usage Example

```typescript
import { useLocationAutoFill } from '@/hooks/useLocationAutoFill'

const {
  isLoading,
  locationData,
  error,
  isValidZipcode,
} = useLocationAutoFill({
  country: 'United States',
  zipcode: '90210',
  onLocationFound: (location) => {
    setCity(location.city)
    setState(location.state)
  },
  autoTrigger: true,
})
```

## 🌍 Supported Countries

### Primary Support (Zippopotam.us)
- **United States** - 5-digit ZIP codes (12345) or ZIP+4 (12345-6789)
- **Canada** - Postal codes (A1A 1A1 or A1A1A1)
- **Germany** - 5-digit postal codes (12345)
- **France** - 5-digit postal codes (12345)
- **Italy** - 5-digit postal codes (12345)
- **Spain** - 5-digit postal codes (12345)
- **Portugal** - 4-digit postal codes (1234)
- **Netherlands** - 4-digit postal codes (1234)
- **Belgium** - 4-digit postal codes (1234)
- **Austria** - 4-digit postal codes (1234)
- **Switzerland** - 4-digit postal codes (1234)
- **Luxembourg** - 4-digit postal codes (1234)
- **United Kingdom** - UK postal codes (SW1A 1AA)

### Secondary Support
- **India** - 6-digit PIN codes (123456) via PostalPincode API

## 🧪 Testing

### Test Cases
1. **US ZIP Code**: Country: "United States", ZIP: "90210" → Beverly Hills, CA
2. **Canadian Postal Code**: Country: "Canada", ZIP: "M5V 3L9" → Toronto, ON
3. **German Postal Code**: Country: "Germany", ZIP: "10115" → Berlin
4. **Invalid ZIP**: Any invalid format → Shows validation error

### Demo Component
Use `LocationAutoFillDemo` component to test the functionality:

```typescript
import { LocationAutoFillDemo } from '@/components/demo/location-auto-fill-demo'

// In your page/component
<LocationAutoFillDemo />
```

## 🔧 Configuration

### Debounce Settings
- **Default**: 800ms for simple hook, 1000ms for property forms
- **Customizable**: Pass `debounceMs` parameter to adjust timing

### Validation Patterns
The service includes country-specific zipcode validation:

```typescript
const patterns = {
  'us': /^\d{5}(-\d{4})?$/,     // 12345 or 12345-6789
  'ca': /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, // A1A 1A1
  'de': /^\d{5}$/,              // 12345
  // ... more patterns
}
```

## 🚨 Error Handling

The system handles various error scenarios:
- **Invalid zipcode format**: Shows format-specific error message
- **API failures**: Tries multiple APIs before failing
- **No data found**: Shows "No location data found" message
- **Network errors**: Shows connection error message

## 🎨 Visual Indicators

### Zipcode Input States
- **Default**: Gray border
- **Loading**: Blue border + spinning loader icon
- **Success**: Green border + checkmark icon
- **Error**: Red border + alert icon

### Status Messages
- **Loading**: "🔍 Looking up location..."
- **Invalid Format**: "Invalid zipcode format for [country]"
- **Error**: Specific error message from API
- **Success**: Auto-filled values appear in city/state fields

## 🔄 Integration with Existing Forms

The feature integrates seamlessly with the existing country-state-city dropdown system:

1. **User enters zipcode** → API lookup triggered
2. **Location found** → Automatically selects matching options in dropdowns
3. **Form updates** → City and state fields populated
4. **User can override** → Manual selection still works

## 📈 Performance Considerations

- **Debounced requests**: Prevents API spam while typing
- **Caching**: Consider implementing caching for frequently used zipcodes
- **Fallback APIs**: Multiple providers ensure high availability
- **Validation first**: Only makes API calls for valid zipcode formats

## 🔮 Future Enhancements

1. **Caching Layer**: Store successful lookups in localStorage/sessionStorage
2. **More APIs**: Add support for more international postal code APIs
3. **Offline Support**: Include offline zipcode databases for major countries
4. **Coordinates**: Extend to include latitude/longitude data
5. **Address Validation**: Full address validation and standardization

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: APIs should support CORS, but check browser console
2. **Rate Limiting**: Some APIs may have rate limits for heavy usage
3. **Invalid Responses**: Check API response format changes
4. **Country Mapping**: Ensure country names match API expectations

### Debug Mode
Enable console logging to see API calls and responses:

```typescript
// In locationService.ts, API calls log to console
console.log(`Trying ${name} service for ${countryCode}/${zipcode}`)
```

This comprehensive location auto-fill system provides a smooth user experience while maintaining reliability and international support! 🌟
