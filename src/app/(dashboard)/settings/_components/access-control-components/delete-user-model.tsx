import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

const DeleteUserModal = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user: {
    id?: string
    role: string
    name: string
    email: string
  } | null
}) => {
  const [password, setPassword] = useState('')

  if (!isOpen || !user) return null

  const handleCancel = () => {
    setPassword('')
    onClose()
  }

  const handleDelete = () => {
    console.log('Entered Password:', password)
    console.log('User to Delete:', user)
    // TODO: Replace with actual delete API call
    onClose()
  }

  const isDeleteEnabled = password.trim() !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-secondary text-lg font-medium">Delete User</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">
              Enter Password to perform this action
            </Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                  isDeleteEnabled
                    ? 'bg-secondary text-white hover:bg-white hover:text-red-600'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
                disabled={!isDeleteEnabled}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserModal
