import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlobalContextProvider } from '@/providers/global-context'
import { apiClient } from '@/utils/api'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const AddressModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { accountDetails, setAccountDetails } = useGlobalContextProvider()

  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  })
  const [originalData, setOriginalData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  })
  const [isChanged, setIsChanged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset when modal opens with data from accountDetails
  useEffect(() => {
    if (isOpen && accountDetails) {
      const initialData = {
        addressLine1: accountDetails.address.addressLine1 || '',
        addressLine2: accountDetails.address.addressLine2 || '',
        city: accountDetails.address.city || '',
        state: accountDetails.address.state || '',
        country: accountDetails.address.country || '',
        zipCode: accountDetails.address.zipCode || '',
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setIsChanged(false)
    }
  }, [isOpen, accountDetails])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    const changed = Object.keys(updatedData).some(
      (key) =>
        updatedData[key as keyof typeof updatedData] !==
        originalData[key as keyof typeof originalData]
    )
    setIsChanged(changed)
  }

  const handleSave = async () => {
    const hasAnyValue = Object.values(formData).some((value) => value.trim())
    if (!hasAnyValue) {
      toast.error('Please fill at least one address field')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.put('/settings/address', {
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode.trim(),
      })

      if (response.data.success) {
        // Update global context
        setAccountDetails((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            country: formData.country.trim(),
            zipCode: formData.zipCode.trim(),
          },
        }))

        setOriginalData(formData)
        setIsChanged(false)

        toast.success('Address updated successfully')
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        toast.error(response.data.message || 'Failed to update address')
      }
    } catch (error: any) {
      console.error('Failed to update address:', error)
      toast.error(
        error.response?.data?.message ||
          'Failed to update address. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsChanged(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[650px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="truncate pl-1 text-xl font-semibold">
                  Change Address
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
                {/* Address Line 1 */}
                <div>
                  <Label className="text-md pb-2 text-[#757575]">
                    Address Line 1
                  </Label>
                  <Input
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <Label className="text-md pb-2 text-[#757575]">
                    Address Line 2
                  </Label>
                  <Input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-md pb-2 text-[#757575]">City</Label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-md pb-2 text-[#757575]">State</Label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Country + Zip Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-md pb-2 text-[#757575]">
                      Country
                    </Label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-md pb-2 text-[#757575]">
                      Zip Code
                    </Label>
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
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
                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
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

export default AddressModel
