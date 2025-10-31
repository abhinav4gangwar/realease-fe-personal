import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/utils/api'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const EditUserModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
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
  onUserUpdated?: () => void
}) => {
  const [roles, setRoles] = useState([])
  const [roleId, setRoleId] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiClient.get('/roles')
        if (response.data.success && response.data.data) {
          // Filter out Super Admin role
          const availableRoles = response.data.data.customRoles.filter(
            role => role.roleId !== 'super-admin'
          )
          setRoles(availableRoles)
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        toast.error('Failed to load roles')
      }
    }

    if (isOpen) {
      fetchRoles()
    }
  }, [isOpen])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setRoleId(user.role.roleId || '')
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleCancel = () => {
    if (user) {
      setName(user.name || '')
      setRoleId(user.role.roleId || '')
    }
    onClose()
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      const response = await apiClient.put(`/users/${user.id}`, {
        name: name.trim(),
        roleId: roleId
      })

      if (response.data.success) {
        toast.success('User updated successfully')
        onClose()
        // Trigger refresh of user list
        if (onUserUpdated) {
          onUserUpdated()
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const isUpdateEnabled = roleId.trim() !== '' && name.trim() !== '' && !loading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg font-medium">Edit User</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          {/* Role */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">Role</Label>
            <select
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.roleId}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">User Name</Label>
            <Input
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">User Email</Label>
            <Input
              placeholder="Enter Email"
              value={user.email}
              type="email"
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
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
                className={`h-11 w-[150px] cursor-pointer border px-6 ${
                  isUpdateEnabled
                    ? 'bg-secondary hover:bg-white hover:text-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isUpdateEnabled}
                onClick={handleUpdate}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal