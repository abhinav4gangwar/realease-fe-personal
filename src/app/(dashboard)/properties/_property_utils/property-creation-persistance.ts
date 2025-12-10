import { CountryType, Properties } from "@/types/property.types"
import { CustomField } from "../_components/properties-edit-model"

const STORAGE_KEY = 'createPropertyFormData'

export interface PersistedFormData {
  formData: Properties
  customFields: CustomField[]
  isDisputed: boolean | null // null means "I'll do it later"
  partyA: string
  partyB: string
  selectedUnit: string
  selectedCountry: CountryType | null
  currentStep: number
  timestamp: number
}


export const loadPersistedData = (): PersistedFormData | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed: PersistedFormData = JSON.parse(savedData)
      
      const daysSinceLastSave = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSinceLastSave > 7) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return parsed
    }
    return null
  } catch (error) {
    console.error('Error loading persisted data:', error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const saveToLocalStorage = (data: PersistedFormData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const clearPersistedData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing persisted data:', error)
  }
}