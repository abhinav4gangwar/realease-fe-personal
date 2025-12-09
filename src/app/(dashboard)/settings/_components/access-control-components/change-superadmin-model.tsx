import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/utils/api'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ChangeSuperAdminModel = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: {
  isOpen: boolean
  onClose: () => void
  user: any
  onUserUpdated?: () => void
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [formData, setFormData] = useState({
    currentEmail: '',
    newEmail: '',
    password: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({ currentEmail: '', newEmail: '', password: '' })
      setOtp(['', '', '', '', '', ''])
      setStep('email')
      setIsVerified(null)
      setIsChanged(false)
    }
  }, [isOpen])

  const handleCurrentEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const updatedData = { ...formData, currentEmail: value }
    setFormData(updatedData)

    if (value.trim().toLowerCase() === user?.email.toLowerCase()) {
      setIsVerified(true)
    } else {
      setIsVerified(false)
    }

    checkIfChanged(updatedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    checkIfChanged(updatedData)
  }

  const checkIfChanged = (data: typeof formData) => {
    const changed =
      isVerified === true &&
      data.newEmail.trim() !== '' &&
      data.password.trim() !== ''
    setIsChanged(changed)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
  }

  const handleRequestEmailChange = async () => {
    if (!formData.newEmail.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.newEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('/settings/email/request', {
        newEmail: formData.newEmail.trim(),
        password: formData.password,
      })

      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent to new email address')
        setStep('otp')
      } else {
        toast.error(response.data.message || 'Failed to request email change')
      }
    } catch (error: any) {
      console.error('Failed to request email change:', error)
      toast.error(
        error.response?.data?.message ||
          'Failed to request email change. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter the complete OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('/settings/email/verify', {
        otp: otpString,
      })

      if (response.data.success) {
        toast.success('Super Admin email updated successfully')

        // Refresh the user list
        if (onUserUpdated) {
          onUserUpdated()
        }

        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        toast.error(response.data.message || 'Failed to verify OTP')
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error)
      toast.error(
        error.response?.data?.message ||
          'Failed to verify OTP. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ currentEmail: '', newEmail: '', password: '' })
    setOtp(['', '', '', '', '', ''])
    setStep('email')
    setIsVerified(null)
    setIsChanged(false)
    onClose()
  }

  const handleBack = () => {
    setStep('email')
    setOtp(['', '', '', '', '', ''])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg font-medium">
            {step === 'email'
              ? 'Change Super Admin Email'
              : 'Verify OTP'}
          </h1>
        </div>

        {/* Content */}
        <div className="px-4 py-8">
          {step === 'email' ? (
            <div className="flex flex-col gap-6">
              {/* Current Email Verification */}
              <div className="flex flex-col gap-2">
                <Label className="text-md font-normal text-[#757575]">
                  Enter Current Super Admin Email Address
                </Label>
                <Input
                  placeholder="Enter Email"
                  value={formData.currentEmail}
                  onChange={handleCurrentEmailChange}
                  disabled={isLoading}
                />
                {isVerified === true && (
                  <span className="text-sm text-green-600">
                    ✅ Email verified successfully
                  </span>
                )}
                {isVerified === false && formData.currentEmail.trim() !== '' && (
                  <span className="text-sm text-red-600">
                    ❌ Email does not match current Super Admin
                  </span>
                )}
              </div>

              {/* New Email */}
              <div className="flex flex-col gap-2">
                <Label className="text-md font-normal text-[#757575]">
                  Enter New Super Admin Email Address
                </Label>
                <Input
                  name="newEmail"
                  type="email"
                  placeholder="Enter new email address"
                  value={formData.newEmail}
                  onChange={handleChange}
                  disabled={!isVerified || isLoading}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-md font-normal text-[#757575]">
                  Current Password
                </Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter your current password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!isVerified || isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <p className="text-gray-600">
                  We've sent a verification code to
                </p>
                <p className="font-semibold text-gray-800">
                  {formData.newEmail}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please enter the 6-digit code below
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={isLoading}
                    className="h-14 w-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex items-center gap-5">
              {step === 'otp' && (
                <Button
                  className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                className={`h-11 w-[150px] cursor-pointer border px-6 ${
                  step === 'email'
                    ? isChanged && !isLoading
                      ? 'bg-secondary hover:bg-white hover:text-secondary'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    : otp.every((d) => d !== '') && !isLoading
                      ? 'bg-secondary hover:bg-white hover:text-secondary'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
                disabled={
                  step === 'email'
                    ? !isChanged || isLoading
                    : !otp.every((d) => d !== '') || isLoading
                }
                onClick={
                  step === 'email' ? handleRequestEmailChange : handleVerifyOtp
                }
              >
                {isLoading
                  ? 'Processing...'
                  : step === 'email'
                    ? 'Send OTP'
                    : 'Verify'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeSuperAdminModel