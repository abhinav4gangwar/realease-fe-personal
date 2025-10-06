import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

const NameModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const dummyData = {
    firstName: 'Ghanshyam Das ',
    lastName: 'Sharma',
  }

  const [formData, setFormData] = useState(dummyData)
  const [originalData, setOriginalData] = useState(dummyData)
  const [isChanged, setIsChanged] = useState(false)

  // When modal opens, reset data
  useEffect(() => {
    if (isOpen) {
      setFormData(dummyData)
      setOriginalData(dummyData)
      setIsChanged(false)
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    // Check if anything changed
    const changed =
      updatedData.firstName !== originalData.firstName ||
      updatedData.lastName !== originalData.lastName
    setIsChanged(changed)
  }

  const handleSave = () => {
    console.log('New name:', formData)
    setOriginalData(formData)
    setIsChanged(false)
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
                    First Name
                  </Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label className="text-md pb-2 text-[#757575]">
                    Last Name
                  </Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
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
                  >
                    Cancel
                  </Button>

                  <Button
                    className={`h-11 w-[150px] cursor-pointer px-6 ${
                      isChanged
                        ? 'bg-secondary hover:text-secondary hover:border hover:bg-white'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
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

export default NameModel
