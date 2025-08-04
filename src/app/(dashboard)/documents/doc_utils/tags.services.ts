import { apiClient } from '@/utils/api'
import { toast } from 'sonner'

export interface Tag {
  id: number
  userId: number
  color: string | null
  name: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export const tagsApi = {
  async getTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get('/dashboard/documents/tags/list')
      return response.data
    } catch (error: any) {
      console.error('Error fetching tags:', error)
      const errorMessage = 'Failed to load tags. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  async createTag(name: string): Promise<Tag[]> {
    try {
      const response = await apiClient.post(
        '/dashboard/documents/tags/create',
        {
          name: name,
        }
      )
      toast.success('Tag created successfully')
      return response.data
    } catch (error: any) {
      console.error('Error creating tag:', error)
      const errorMessage = 'Failed to create tag. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  async deleteTag(id: number): Promise<Tag[]> {
    try {
      const response = await apiClient.delete(
        `/dashboard/documents/tags/delete/${id}`
      )
      toast.success('Tag deleted successfully')
      return response.data
    } catch (error: any) {
      console.error('Error deleting tag:', error)
      const errorMessage = 'Failed to delete tag. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },
}
