import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'

import { useState } from 'react'
import { toast } from 'sonner'

const DeleteUserModal = ({
  isOpen,
  onClose,
  user,
  onUserDeleted
}: {
  isOpen: boolean
  onClose: () => void
  user: {
    id?: number
    role: {
      name: string
      roleId: string
    }
    name: string
    email: string
  } | null
  onUserDeleted?: () => void
}) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleCancel = () => {
    onClose()
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await apiClient.delete(`/users/${user.id}`)

      if (response.data.success) {
        toast.success('User deleted successfully')
        onClose()
        if (onUserDeleted) {
          onUserDeleted()
        }
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-secondary text-lg font-medium">Delete User</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          <div className="text-secondary">
            <p className="text-lg">
              Are you sure you want to delete this user?
            </p>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex items-center gap-5">
              <Button
                className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                className="h-11 w-[150px] cursor-pointer bg-primary"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal