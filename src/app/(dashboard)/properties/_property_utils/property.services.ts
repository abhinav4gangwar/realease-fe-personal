import { Properties } from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { toast } from 'sonner'

export const propertiesApi = {
  async getProperties(): Promise<Properties[]> {
    try {
      const response = await apiClient.get('/dashboard/properties/list')
      return response.data.allProperties
    } catch (error: any) {
      toast.error(error)
      throw error
    }
  },
}
