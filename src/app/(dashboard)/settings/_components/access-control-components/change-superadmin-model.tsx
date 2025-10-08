import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

const ChangeSuperAdminModel = ({
  isOpen,
  onClose,
  user
}: {
  isOpen: boolean
  onClose: () => void
  user: any
}) => {
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  if (!isOpen) return null

  const handleCurrentEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentEmail(value)

    if (value.trim().toLowerCase() === user.email.toLowerCase()) {
      setIsVerified(true)
    } else {
      setIsVerified(false)
    }
  }

  const handleGenerateOTP = () => {
    console.log('Current Email:', currentEmail)
    console.log('New Email:', newEmail)
  }

  const handleCancel = () => {
    setCurrentEmail('')
    setNewEmail('')
    setIsVerified(null)
    onClose()
  }

  const isGenerateEnabled = isVerified && newEmail.trim() !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg font-medium">Change Super Admin</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4 py-8">
          {/* Current Email */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">
              Enter Current Super Admin Email Address
            </Label>
            <Input
              placeholder="Enter Email"
              value={currentEmail}
              onChange={handleCurrentEmailChange}
            />
            {isVerified === true && (
              <span className="text-sm text-green-600">✅ Email verified successfully</span>
            )}
            {isVerified === false && (
              <span className="text-sm text-red-600">❌ Email does not match current Super Admin</span>
            )}
          </div>

          {/* New Email */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-normal text-[#757575]">
              Enter New Super Admin Email Address
            </Label>
            <Input
              placeholder="Enter Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={!isVerified}
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
                  isGenerateEnabled
                    ? 'bg-secondary hover:bg-white hover:text-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isGenerateEnabled}
                onClick={handleGenerateOTP}
              >
                Generate OTP
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeSuperAdminModel
