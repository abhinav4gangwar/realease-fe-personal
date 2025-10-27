import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlobalContextProvider } from '@/providers/global-context'
import { apiClient } from '@/utils/api'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const EmailChangeModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { accountDetails, setAccountDetails } = useGlobalContextProvider()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({ newEmail: '', password: '' })
      setOtp(['', '', '', '', '', ''])
      setStep('email')
      setIsChanged(false)
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    const changed =
      updatedData.newEmail.trim() !== '' && updatedData.password.trim() !== ''
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
        setAccountDetails((prev: any) => ({
          ...prev,
          email: response.data.data.email,
        }))

        toast.success('Email address updated successfully')

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
    setFormData({ newEmail: '', password: '' })
    setOtp(['', '', '', '', '', ''])
    setStep('email')
    setIsChanged(false)
  }

  const handleBack = () => {
    setStep('email')
    setOtp(['', '', '', '', '', ''])
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[550px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="truncate pl-1 text-xl font-semibold">
                  {step === 'email' ? 'Change Email Address' : 'Verify OTP'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {step === 'email' ? (
                <div className="flex flex-col space-y-6 py-3">
                  <div>
                    <Label className="text-md pb-2 text-[#757575]">
                      Current Email
                    </Label>
                    <Input
                      value={accountDetails?.email || 'Not Provided'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label className="text-md pb-2 text-[#757575]">
                      New Email Address
                    </Label>
                    <Input
                      name="newEmail"
                      type="email"
                      placeholder="Enter new email address"
                      value={formData.newEmail}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-md pb-2 text-[#757575]">
                      Current Password
                    </Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter your current password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-6 py-3">
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
                    className={`h-11 w-[150px] cursor-pointer px-6 ${
                      step === 'email'
                        ? isChanged && !isLoading
                          ? 'bg-secondary hover:text-secondary hover:border hover:bg-white'
                          : 'cursor-not-allowed bg-gray-300 text-gray-500'
                        : otp.every((d) => d !== '') && !isLoading
                          ? 'bg-secondary hover:text-secondary hover:border hover:bg-white'
                          : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                    disabled={
                      step === 'email'
                        ? !isChanged || isLoading
                        : !otp.every((d) => d !== '') || isLoading
                    }
                    onClick={
                      step === 'email'
                        ? handleRequestEmailChange
                        : handleVerifyOtp
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
      )}
    </>
  )
}

export default EmailChangeModel
