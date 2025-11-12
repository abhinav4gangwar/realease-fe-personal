import { apiClient } from '@/utils/api'

export interface Tag {
  id: number
  name: string
  color: string | null
}

export interface LocalitiesResponse {
  localities: string[]
}

export interface CitiesResponse {
  cities: string[]
}

export interface StatesResponse {
  states: string[]
}

export interface CountriesResponse {
  countries: string[]
}

export interface OwnersResponse {
  owners: string[]
}

export interface TagsResponse {
  tags: Tag[]
}

export const analyticsHelpers = {
  /**
   * Fetch all localities
   */
  fetchLocalities: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<LocalitiesResponse>(
        '/analytics/helpers/localities'
      )
      return response.data.localities || []
    } catch (error) {
      console.error('Failed to fetch localities:', error)
      return []
    }
  },

  /**
   * Fetch all cities
   */
  fetchCities: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<CitiesResponse>(
        '/analytics/helpers/cities'
      )
      return response.data.cities || []
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      return []
    }
  },

  /**
   * Fetch all states
   */
  fetchStates: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<StatesResponse>(
        '/analytics/helpers/states'
      )
      return response.data.states || []
    } catch (error) {
      console.error('Failed to fetch states:', error)
      return []
    }
  },

  /**
   * Fetch all countries
   */
  fetchCountries: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<CountriesResponse>(
        '/analytics/helpers/countries'
      )
      return response.data.countries || []
    } catch (error) {
      console.error('Failed to fetch countries:', error)
      return []
    }
  },

  /**
   * Fetch all owners
   */
  fetchOwners: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<OwnersResponse>(
        '/analytics/helpers/owners'
      )
      return response.data.owners || []
    } catch (error) {
      console.error('Failed to fetch owners:', error)
      return []
    }
  },

  /**
   * Fetch all tags
   */
  fetchTags: async (): Promise<Tag[]> => {
    try {
      const response = await apiClient.get<TagsResponse>(
        '/analytics/helpers/tags'
      )
      return response.data.tags || []
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      return []
    }
  },
}
