import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGlobalContextProvider } from '@/providers/global-context'
import { apiClient } from '@/utils/api'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'


const NameModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { accountDetails, setAccountDetails } = useGlobalContextProvider()
  const [formData, setFormData] = useState({ firstName: '' })
  const [originalData, setOriginalData] = useState({ firstName: '' })
  const [isChanged, setIsChanged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const initialData = { firstName: accountDetails.name || '' }
      setFormData(initialData)
      setOriginalData(initialData)
      setIsChanged(false)
    }
  }, [isOpen, accountDetails.name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    const changed = updatedData.firstName !== originalData.firstName
    setIsChanged(changed)
  }

  const handleSave = async () => {
    if (!formData.firstName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.put('/settings/name', {
        name: formData.firstName.trim(),
      })

      if (response.data.success) {
        setAccountDetails((prev: any) => ({
          ...prev,
          name: formData.firstName.trim(),
        }))

        setOriginalData(formData)
        setIsChanged(false)

        toast.success('Name updated successfully')
        
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        toast.error(response.data.message || 'Failed to update name')
      }
    } catch (error: any) {
      console.error('Failed to update name:', error)
      toast.error(
        error.response?.data?.message || 'Failed to update name. Please try again.'
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
          <div className="fixed top-0 right-0 z-50 flex h-full w-[550px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="truncate pl-1 text-xl font-semibold">
                  Change Name
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
                <div>
                  <Label className="text-md pb-2 text-[#757575]">
                    Update Name
                  </Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
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

export default NameModel