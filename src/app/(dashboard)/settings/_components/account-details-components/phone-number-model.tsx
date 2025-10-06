import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

const PhoneNumberModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  // Dummy JSON for pre-existing number
  const dummyData = {
    countryCode: '+91',
    phoneNumber: '2736467829',
  }

  const [currentNumber, setCurrentNumber] = useState(dummyData)
  const [newNumber, setNewNumber] = useState({ countryCode: '', phoneNumber: '' })
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCurrentNumber(dummyData)
      setNewNumber({ countryCode: '', phoneNumber: '' })
      setOtpSent(false)
      setOtp(['', '', '', '', '', ''])
      setIsChanged(false)
    }
  }, [isOpen])

  const handleNewNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = { ...newNumber, [name]: value }
    setNewNumber(updated)
    setIsChanged(!!updated.phoneNumber && updated.phoneNumber !== currentNumber.phoneNumber)
  }

  const handleSendOtp = () => {
    if (!newNumber.phoneNumber) return
    console.log('Sending OTP to:', `${newNumber.countryCode} ${newNumber.phoneNumber}`)
    setOtpSent(true)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const updatedOtp = [...otp]
    updatedOtp[index] = value.replace(/\D/g, '')
    setOtp(updatedOtp)

    // Move to next input automatically
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    const isAllFilled = updatedOtp.every((digit) => digit !== '')
    setIsChanged(isAllFilled)
  }

  const handleSave = () => {
    const enteredOtp = otp.join('')
    console.log('New Number:', `${newNumber.countryCode} ${newNumber.phoneNumber}`)
    console.log('Entered OTP:', enteredOtp)
    setCurrentNumber(newNumber)
    setOtpSent(false)
    setOtp(['', '', '', '', '', ''])
    setIsChanged(false)
  }

  const handleCancel = () => {
    setNewNumber({ countryCode: '+1', phoneNumber: '' })
    setOtpSent(false)
    setOtp(['', '', '', '', '', ''])
    setIsChanged(false)
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
                  Change Phone Number
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col space-y-6 py-3">
                {/* Current Phone */}
                <div>
                  <Label className="pb-2 text-md text-[#757575]">
                    Current Phone Number
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      className="w-24"
                      value={currentNumber.countryCode}
                      disabled
                    />
                    <Input
                      value={currentNumber.phoneNumber}
                      disabled
                    />
                  </div>
                </div>

                {/* New Phone */}
                <div>
                  <Label className="pb-2 text-md text-[#757575]">
                    New Phone Number
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      className="w-24"
                      name="countryCode"
                      value={newNumber.countryCode}
                      onChange={handleNewNumberChange}
                    />
                    <Input
                      name="phoneNumber"
                      value={newNumber.phoneNumber}
                      onChange={handleNewNumberChange}
                    />
                    <Button
                      className="h-14 px-4 bg-primary hover:text-primary hover:bg-white border"
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </Button>
                  </div>
                </div>

                {/* OTP Section */}
                {otpSent && (
                  <div className="flex flex-col space-y-3">
                    <Label className="text-md text-[#757575]">
                      Enter OTP
                    </Label>
                    <div className="flex gap-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          className="w-12 text-center text-lg"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    className={`h-11 w-[150px] cursor-pointer px-6 ${
                      isChanged
                        ? 'bg-secondary hover:text-secondary hover:border hover:bg-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isChanged}
                    onClick={handleSave}
                  >
                    Save
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

export default PhoneNumberModel
