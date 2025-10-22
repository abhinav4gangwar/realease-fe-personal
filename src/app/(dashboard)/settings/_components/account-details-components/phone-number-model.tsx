import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useGlobalContextProvider } from '@/providers/global-context'
import { apiClient } from '@/utils/api'

const PhoneNumberModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { accountDetails, setAccountDetails } = useGlobalContextProvider()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isChanged, setIsChanged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && accountDetails) {
      setPhoneNumber(accountDetails.phone || '')
      setIsChanged(false)
    }
  }, [isOpen, accountDetails])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    setIsChanged(value !== (accountDetails?.phone || '') && value.trim() !== '')
  }

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.put('/settings/phone', {
        phone: phoneNumber,
      })

      if (response.data.success) {
        toast.success('Phone number updated successfully')

        if (accountDetails && setAccountDetails) {
          setAccountDetails({
            ...accountDetails,
            phone: response.data.data.phone,
          })
        }
        
        setIsChanged(false)
        onClose()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update phone number'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPhoneNumber(accountDetails?.phone || '')
    setIsChanged(false)
    onClose()
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
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col space-y-6 py-3">
                {/* Phone Number */}
                <div>
                  <Label className="pb-2 text-md text-[#757575]">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="text-secondary hover:bg-secondary h-11 w-[150px] cursor-pointer border border-gray-400 bg-white px-6 hover:text-white"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    className={`h-11 w-[150px] cursor-pointer px-6 ${
                      isChanged && !isLoading
                        ? 'bg-secondary hover:text-secondary hover:border hover:bg-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isChanged || isLoading}
                    onClick={handleSave}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
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