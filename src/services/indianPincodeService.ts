/**
 * Service for handling Indian pincode data from GeoJSON
 * Maps division=district and circle=state as per user requirements
 */

export interface IndianPincodeFeature {
  type: 'Feature'
  properties: {
    Pincode: string
    Office_Name: string
    Division: string  // Maps to district
    Region: string
    Circle: string    // Maps to state
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface IndianPincodeData {
  type: 'FeatureCollection'
  name: string
  crs: {
    type: 'name'
    properties: {
      name: string
    }
  }
  features: IndianPincodeFeature[]
}

export interface PincodeLocationResult {
  pincode: string
  officeName: string
  district: string  // Mapped from Division
  state: string     // Mapped from Circle
  region: string
  coordinates?: [number, number] // Center of polygon
}

class IndianPincodeService {
  private data: IndianPincodeData | null = null
  private cache = new Map<string, PincodeLocationResult>()

  /**
   * Load the Indian pincode data from the static JSON file
   */
  async loadData(): Promise<void> {
    if (this.data) return // Already loaded

    try {
      console.log('📥 Loading Indian pincode data from /data/indian-pincodes.json')
      const response = await fetch('/data/indian-pincodes.json')
      if (!response.ok) {
        throw new Error(`Failed to load pincode data: ${response.status}`)
      }
      this.data = await response.json()
      console.log(`✅ Indian pincode data loaded successfully - ${this.data.features.length} pincodes available`)
    } catch (error) {
      console.error('❌ Failed to load Indian pincode data:', error)
      throw error
    }
  }

  /**
   * Find location data for a given pincode
   */
  async findByPincode(pincode: string): Promise<PincodeLocationResult | null> {
    console.log(`🔍 Searching for pincode: ${pincode}`)

    // Check cache first
    if (this.cache.has(pincode)) {
      console.log(`📦 Cache hit for pincode: ${pincode}`)
      return this.cache.get(pincode)!
    }

    // Load data if not already loaded
    if (!this.data) {
      await this.loadData()
    }

    if (!this.data) {
      console.log('❌ No pincode data available')
      return null
    }

    // Find the feature with matching pincode
    const feature = this.data.features.find(f => f.properties.Pincode === pincode)

    if (!feature) {
      console.log(`❌ Pincode ${pincode} not found in ${this.data.features.length} available pincodes`)
      return null
    }

    console.log(`✅ Found pincode ${pincode}:`, feature.properties)

    // Calculate center coordinates from polygon
    const coordinates = this.calculatePolygonCenter(feature.geometry.coordinates[0])

    const result: PincodeLocationResult = {
      pincode: feature.properties.Pincode,
      officeName: feature.properties.Office_Name,
      district: feature.properties.Division.trim(), // Division maps to district
      state: feature.properties.Circle.trim(),      // Circle maps to state
      region: feature.properties.Region,
      coordinates
    }

    // Cache the result
    this.cache.set(pincode, result)
    
    return result
  }

  /**
   * Search for pincodes by district name
   */
  async findByDistrict(district: string): Promise<PincodeLocationResult[]> {
    if (!this.data) {
      await this.loadData()
    }

    if (!this.data) {
      return []
    }

    const results: PincodeLocationResult[] = []
    const districtLower = district.toLowerCase().trim()

    for (const feature of this.data.features) {
      if (feature.properties.Division.toLowerCase().trim().includes(districtLower)) {
        const coordinates = this.calculatePolygonCenter(feature.geometry.coordinates[0])
        
        results.push({
          pincode: feature.properties.Pincode,
          officeName: feature.properties.Office_Name,
          district: feature.properties.Division.trim(),
          state: feature.properties.Circle.trim(),
          region: feature.properties.Region,
          coordinates
        })
      }
    }

    return results
  }

  /**
   * Search for pincodes by state name
   */
  async findByState(state: string): Promise<PincodeLocationResult[]> {
    if (!this.data) {
      await this.loadData()
    }

    if (!this.data) {
      return []
    }

    const results: PincodeLocationResult[] = []
    const stateLower = state.toLowerCase().trim()

    for (const feature of this.data.features) {
      if (feature.properties.Circle.toLowerCase().trim().includes(stateLower)) {
        const coordinates = this.calculatePolygonCenter(feature.geometry.coordinates[0])
        
        results.push({
          pincode: feature.properties.Pincode,
          officeName: feature.properties.Office_Name,
          district: feature.properties.Division.trim(),
          state: feature.properties.Circle.trim(),
          region: feature.properties.Region,
          coordinates
        })
      }
    }

    return results
  }

  /**
   * Calculate the center point of a polygon
   */
  private calculatePolygonCenter(coordinates: number[][]): [number, number] {
    let totalLat = 0
    let totalLng = 0
    const pointCount = coordinates.length

    for (const [lng, lat] of coordinates) {
      totalLng += lng
      totalLat += lat
    }

    return [totalLat / pointCount, totalLng / pointCount]
  }

  /**
   * Get all available states
   */
  async getStates(): Promise<string[]> {
    if (!this.data) {
      await this.loadData()
    }

    if (!this.data) {
      return []
    }

    const states = new Set<string>()
    for (const feature of this.data.features) {
      states.add(feature.properties.Circle.trim())
    }

    return Array.from(states).sort()
  }

  /**
   * Get all districts for a given state
   */
  async getDistrictsByState(state: string): Promise<string[]> {
    if (!this.data) {
      await this.loadData()
    }

    if (!this.data) {
      return []
    }

    const districts = new Set<string>()
    const stateLower = state.toLowerCase().trim()

    for (const feature of this.data.features) {
      if (feature.properties.Circle.toLowerCase().trim().includes(stateLower)) {
        districts.add(feature.properties.Division.trim())
      }
    }

    return Array.from(districts).sort()
  }
}

// Export singleton instance
export const indianPincodeService = new IndianPincodeService()
