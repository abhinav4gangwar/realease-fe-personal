import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'

const EditUserModal = ({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean
  onClose: () => void
  user: {
    role: string
    name: string
    email: string
  } | null
}) => {
  const [role, setRole] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      setRole(user.role || '')
      setFirstName(user.name || '')
      setLastName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  if (!isOpen) return null

  const handleCancel = () => {
    if (user) {
      setRole(user.role || '')
      setFirstName(user.name || '')
      setLastName(user.name || '')
      setEmail(user.email || '')
    }
    onClose()
  }

  const handleUpdate = () => {
    const updatedUser = {
      ...user,
      role,
      firstName,
      lastName,
      email
    }
    console.log('Updated User:', updatedUser)
    // TODO: Replace with API call to update user
    onClose()
  }

  const isUpdateEnabled =
    role.trim() !== '' && firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== ''

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
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Name Fields */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">User Name</Label>
            <div className="flex gap-4">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">User Email</Label>
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
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
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal
