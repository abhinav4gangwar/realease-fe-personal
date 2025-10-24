import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/utils/api'
import { useLogout } from '@/utils/logout'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'


const DeletePasswordModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [step, setStep] = useState<'password' | 'otp'>('password')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const logout = useLogout()

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setOtp(Array(6).fill(''))
      setStep('password')
    }
  }, [isOpen])

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
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

  const handleRequestDelete = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('/settings/delete-account/request', {
        password: password,
      })

      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent to your email address')
        setStep('otp')
      } else {
        toast.error(response.data.message || 'Failed to verify password')
      }
    } catch (error: any) {
      console.error('Failed to request account deletion:', error)
      toast.error(
        error.response?.data?.message || 'Failed to verify password. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post('/settings/delete-account/verify', {
        otp: otpValue,
      })

      if (response.data.success) {
        toast.success('Account deleted successfully')
        
        setTimeout(() => {
          logout()
        }, 1000)
      } else {
        toast.error(response.data.message || 'Failed to verify OTP')
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error)
      toast.error(
        error.response?.data?.message || 'Failed to verify OTP. Please try again.'
      )
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setStep('password')
    setOtp(Array(6).fill(''))
  }

  const handleCancel = () => {
    setPassword('')
    setOtp(Array(6).fill(''))
    setStep('password')
    onClose()
  }

  const isPasswordValid = password.trim() !== ''
  const isOtpComplete = otp.every((digit) => digit !== '')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg">
            {step === 'password' ? 'Delete Account - Verify Password' : 'Delete Account - Verify OTP'}
          </h1>
        </div>

        {/* content */}
        <div className="flex flex-col gap-4 p-8">
          {step === 'password' ? (
            <>
              <p className="text-[#757575]">
                Enter your current password to confirm account deletion.
              </p>
              <div className="space-y-2">
                <Label className="text-md text-[#757575]">Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isPasswordValid && !isLoading) {
                      handleRequestDelete()
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-[#757575]">
                Enter the OTP sent to your registered Email ID to confirm deletion.
              </p>
              <div className="flex gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    disabled={isLoading}
                    className="h-14 w-12 rounded border border-gray-400 text-center text-xl focus:border-primary focus:outline-none"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex flex-shrink-0 items-center gap-5">
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
                  step === 'password'
                    ? isPasswordValid && !isLoading
                      ? 'bg-secondary hover:text-secondary hover:bg-white'
                      : 'cursor-not-allowed bg-gray-300 opacity-70'
                    : isOtpComplete && !isLoading
                    ? 'bg-secondary hover:text-secondary hover:bg-white'
                    : 'cursor-not-allowed bg-gray-300 opacity-70'
                }`}
                disabled={
                  step === 'password'
                    ? !isPasswordValid || isLoading
                    : !isOtpComplete || isLoading
                }
                onClick={step === 'password' ? handleRequestDelete : handleVerifyOtp}
              >
                {isLoading ? 'Processing...' : step === 'password' ? 'Send OTP' : 'Verify OTP'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeletePasswordModel