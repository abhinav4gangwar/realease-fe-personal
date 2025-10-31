import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/utils/api'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const CreateUserModal = ({
  isOpen,
  onClose,
  onUserCreated
}: {
  isOpen: boolean
  onClose: () => void
  onUserCreated?: () => void
}) => {
  const [roles, setRoles] = useState([])
  const [roleId, setRoleId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

  if (!isOpen) return null

  const handleCancel = () => {
    setRoleId('')
    setName('')
    setEmail('')
    onClose()
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await apiClient.post('/users/invite', {
        name: name.trim(),
        email: email.trim(),
        roleId: roleId
      })

      if (response.data.success) {
        toast.success('User invited successfully! Credentials sent via email.')
        handleCancel()
        // Trigger refresh of user list
        if (onUserCreated) {
          onUserCreated()
        }
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error(error.response?.data?.message || 'Failed to invite user')
    } finally {
      setLoading(false)
    }
  }

  const isSaveEnabled =
    roleId.trim() !== '' && name.trim() !== '' && email.trim() !== '' && !loading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg font-medium">Create User</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          {/* Role */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">Select Role</Label>
            <select
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-secondary"
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

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">User Email</Label>
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              disabled={loading}
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
                  isSaveEnabled
                    ? 'bg-secondary hover:bg-white hover:text-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isSaveEnabled}
                onClick={handleSave}
              >
                {loading ? 'Inviting...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateUserModal