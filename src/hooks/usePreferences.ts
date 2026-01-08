import { apiClient } from '@/utils/api'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type AreaPreference = {
  unit: string
  customUnit: string | null
}

export type Preferences = {
  areaPreferences: {
    land: AreaPreference
    plot: AreaPreference
    residential: AreaPreference
    commercial: AreaPreference
  }
  defaultCurrency: string
  timezone: string
}

const DISPLAY_TO_API: Record<string, string> = {
  Acre: 'acres',
  Hectare: 'hectares',
  'Square yard': 'sq_yards',
  'Square feet': 'sq_ft',
  'Square meter': 'sq_m',
}

const API_TO_DISPLAY: Record<string, string> = Object.fromEntries(
  Object.entries(DISPLAY_TO_API).map(([k, v]) => [v, k])
)

export const mapToApiUnit = (displayUnit: string) =>
  DISPLAY_TO_API[displayUnit] ?? displayUnit

export const mapToDisplayUnit = (apiUnit: string) =>
  API_TO_DISPLAY[apiUnit] ?? apiUnit

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchPreferences = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/preferences')
      if (res?.data?.success) {
        setPreferences(res.data.data as Preferences)
      }
    } catch (e) {
      console.error('fetch preferences error', e)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPrefs: Preferences): Promise<boolean> => {
    try {
      const res = await apiClient.put('/preferences', newPrefs)
      if (res?.data?.success) {
        setPreferences(res.data.data as Preferences)
        toast.success('Preferences updated successfully')
        return true
      }
    } catch (e) {
      toast.error('Failed to update preferences')
      console.error('update preferences error', e)
    }
    return false
  }

  useEffect(() => {
    fetchPreferences()
     
  }, [])

  return { preferences, loading, updatePreferences, refetch: fetchPreferences } as const
}
