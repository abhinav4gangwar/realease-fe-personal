import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const DeletePasswordModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))

  if (!isOpen) return null

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      prevInput?.focus()
    }
  }

 const otpValue = otp.join('')
const isOtpComplete = otp.every((digit) => digit !== '')

  const handleVerify = () => {
    console.log('OTP Value:', otpValue)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* header */}
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <h1 className="text-lg">Delete Account</h1>
        </div>

        {/* content */}
        <div className="flex flex-col gap-4 p-8">
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
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="h-14 w-12 rounded border border-gray-400 text-center text-xl focus:border-primary focus:outline-none"
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex flex-shrink-0 items-center gap-5">
              <Button
                className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                onClick={() => onClose()}
              >
                Cancel
              </Button>

              <Button
                className={`h-11 w-[150px] cursor-pointer border px-6 ${
                  isOtpComplete
                    ? 'bg-secondary hover:text-secondary hover:bg-white'
                    : 'cursor-not-allowed bg-gray-300 opacity-70'
                }`}
                disabled={!isOtpComplete}
                onClick={handleVerify}
              >
                Verify OTP
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeletePasswordModel
