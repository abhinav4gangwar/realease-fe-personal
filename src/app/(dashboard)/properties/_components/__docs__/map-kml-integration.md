# Map KML Integration Documentation

## Overview
The property details map now supports displaying KML files alongside property markers. When viewing a property, the system automatically detects KML files in the property's documents and renders them on the map.

## Features

### 1. Fixed Map Marker Icons
- **Issue**: Leaflet markers were showing as broken images (404 errors for marker-icon-2x.png, marker-shadow.png)
- **Solution**: Added CDN-hosted marker icons from Leaflet's official CDN
- **Result**: Property markers now display correctly with proper icons and shadows

### 2. KML File Detection
The system automatically detects KML files by checking:
- File extension ends with `.kml`
- MIME type contains `kml` or `xml`
- File type includes `octet-stream` (common for KML files)

### 3. KML File Loading
- Uses the correct backend API: `POST /dashboard/documents/download`
- Proper authentication via `apiClient`
- Request format: `{ items: [{ id: 274, type: "file" }] }`

### 4. KML Coordinate Extraction
Supports multiple KML coordinate formats:
- Standard `<coordinates>` elements
- Point coordinates: `longitude,latitude,altitude`
- Point coordinates: `longitude,latitude`
- Handles whitespace, newlines, and multiple coordinate pairs
- Validates coordinate ranges (lat: -90 to 90, lng: -180 to 180)

### 5. Map Visualization
- **Property Marker**: Blue pin at exact property coordinates
- **KML Layers**: Red polylines showing KML coordinate paths
- **Interactive Popups**: Click markers/lines for details
- **Loading Indicator**: Shows "Loading KML files..." during processing

## Usage Example

```typescript
// Property data with KML document
const property = {
  id: "76",
  name: "Test Property",
  latitude: "32.77670000",
  longitude: "-96.79700000",
  documents: [
    {
      doc_id: 274,
      name: "test.kml",
      icon: "file",
      fileType: "octet-stream",
      size: 800
    }
  ]
}

// Map automatically loads and displays:
// 1. Property marker at (32.77670000, -96.79700000)
// 2. KML file content as red polylines
// 3. Interactive popups with property and KML details
```

## Technical Implementation

### Components Updated
1. **FullMapModal** (`map-model.tsx`)
   - Added KML loading functionality
   - Fixed marker icons
   - Added KML layer rendering

2. **MiniMap** (`minimap.tsx`)
   - Fixed marker icons for preview

3. **PropertiesDetailsModel** (`properties-details-model.tsx`)
   - Updated coordinate handling for new backend format
   - Added document passing to map modal

### API Integration
- **Endpoint**: `POST /dashboard/documents/download`
- **Authentication**: Handled by `apiClient`
- **Response**: Raw KML file content as text
- **Error Handling**: Graceful fallbacks for failed downloads

### Coordinate System Support
- **Backend Format**: Separate `latitude` and `longitude` fields
- **Map Format**: Combined coordinate strings for Leaflet
- **Display Format**: User-friendly "lat, lng" format
- **Backward Compatibility**: Still supports old `coordinates` field

## Error Handling
- Invalid KML files are skipped silently
- Network errors are logged but don't break the map
- Missing coordinates show appropriate error messages
- Malformed coordinate data is validated and filtered

## Future Enhancements
- Support for KML polygons and complex shapes
- Custom styling for different KML layers
- KML file metadata display
- Interactive KML editing capabilities
