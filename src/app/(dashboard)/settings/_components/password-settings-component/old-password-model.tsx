"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/utils/api'
import { useState } from 'react'
import { toast } from 'sonner'


const OldPasswordModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleCancel = () => {
    setOldPassword('')
    setNewPassword('')
    onClose()
  }

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  }

  const handleConfirm = async () => {
    if (!validatePassword(newPassword)) {
      toast.error('New password does not meet the required criteria')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('/settings/password', {
        oldPassword,
        newPassword,
      })

      if (response.data.success) {
        toast.success('Password updated successfully')
        setOldPassword('')
        setNewPassword('')
        onClose()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update password'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isConfirmEnabled = oldPassword.trim() !== '' && newPassword.trim() !== '' && !isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-secondary text-lg font-medium">
            Change Password
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          {/* Old Password Field */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">
              Enter old password
            </Label>
            <Input
              type="password"
              placeholder="Enter your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* New Password Field */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">
              Enter new password
            </Label>
            <Input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Password must contain: 8 characters, one uppercase letter, one lowercase letter, one number, and one special character
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
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                className={`h-11 w-[150px] cursor-pointer border px-6 ${
                  isConfirmEnabled
                    ? 'bg-secondary text-white hover:bg-white hover:text-red-600'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
                disabled={!isConfirmEnabled}
                onClick={handleConfirm}
              >
                {isLoading ? 'Updating...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OldPasswordModel