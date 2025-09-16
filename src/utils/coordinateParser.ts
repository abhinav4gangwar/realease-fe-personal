export interface Coordinates {
  lat: number;
  lng: number;
}

export const parseCoordinates = (coordString: string): Coordinates => {
  if (!coordString) {
    return { lat: 0, lng: 0 };
  }

  try {
    // Handle format like "34.0736 N; -118.4004 E" or "34.0736 N; -118.4004 W"
    const parts = coordString.split(';').map(part => part.trim());
    
    if (parts.length !== 2) {
      console.warn('Invalid coordinate format:', coordString);
      return { lat: 0, lng: 0 };
    }

    // Parse latitude (N/S)
    const latPart = parts[0].trim();
    const latMatch = latPart.match(/^([-+]?\d*\.?\d+)\s*([NS])$/i);
    if (!latMatch) {
      console.warn('Invalid latitude format:', latPart);
      return { lat: 0, lng: 0 };
    }
    const lat = parseFloat(latMatch[1]) * (latMatch[2].toLowerCase() === 's' ? -1 : 1);

    // Parse longitude (E/W)
    const lngPart = parts[1].trim();
    const lngMatch = lngPart.match(/^([-+]?\d*\.?\d+)\s*([EW])$/i);
    if (!lngMatch) {
      console.warn('Invalid longitude format:', lngPart);
      return { lat: 0, lng: 0 };
    }
    const lng = parseFloat(lngMatch[1]) * (lngMatch[2].toLowerCase() === 'w' ? -1 : 1);

    return { lat, lng };
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return { lat: 0, lng: 0 };
  }
};