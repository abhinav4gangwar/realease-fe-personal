
export interface MarkerIconProps {
  color?: string
  size?: number
  iconName?: string
  backgroundColor?: string
  borderColor?: string
}

export const createCustomMarker = async ({
  color = '#ffffff',
  size = 32,
  iconName = 'map-pin',
  backgroundColor = '#3b82f6',
  borderColor = '#ffffff'
}: MarkerIconProps = {}) => {
  if (typeof window === 'undefined') {
    return null
  }

  const L = (await import('leaflet')).default

  const iconSvgs: Record<string, string> = {
    'map-pin': `<path d="M20 10c0 6-10 12-10 12s-10-6-10-12a10 10 0 0 1 20 0Z"/><circle cx="10" cy="10" r="3"/>`,
    'home': `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>`,
    'building': `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`,
    'landmark': `<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 14.2 0L21 21"/><path d="m14.5 7.5c.83.83.83 2.17 0 3"/><path d="m9.5 10.5c.83.83.83 2.17 0 3"/>`,
    'alert-triangle': `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/>`
  }

  const iconSvg = iconSvgs[iconName] || iconSvgs['map-pin']

  const svgIcon = `
    <svg 
      width="${size}" 
      height="${size}" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="none"
      style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"
    >
      <!-- Background circle -->
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="${backgroundColor}" 
        stroke="${borderColor}" 
        stroke-width="2"
      />
      <!-- Icon -->
      <g transform="translate(12, 12) scale(0.6)">
        <g transform="translate(-12, -12)">
          <path 
            d="${iconSvg}" 
            fill="${color}" 
            stroke="${color}" 
            stroke-width="1.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </g>
      </g>
    </svg>
  `

  return L.divIcon({
    className: 'custom-div-icon',
    html: svgIcon,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export const getPropertyMarkerIcon = async (
  isSelected: boolean = false,
  isHighlighted: boolean = false,
  isDisputed: boolean = false,
  propertyType?: string
) => {
  if (typeof window === 'undefined') {
    return null
  }

  let backgroundColor = '#3b82f6' 
  let iconName = 'map-pin'
  
  switch (propertyType?.toLowerCase()) {
    case 'residential':
    case 'house':
    case 'apartment':
      iconName = 'home'
      break
    case 'commercial':
    case 'office':
    case 'retail':
      iconName = 'building'
      break
    case 'industrial':
    case 'warehouse':
      iconName = 'building'
      break
    case 'land':
    case 'plot':
      iconName = 'landmark'
      break
    default:
      iconName = 'map-pin'
  }

  if (isDisputed) {
    iconName = 'alert-triangle'
    backgroundColor = '#dc2626' 
  } else if (isSelected) {
    backgroundColor = '#ef4444' 
  } else if (isHighlighted) {
    backgroundColor = '#f97316'
  }

  return await createCustomMarker({
    backgroundColor,
    iconName,
    color: '#ffffff',
    size: isSelected ? 36 : 32,
    borderColor: '#ffffff'
  })
}