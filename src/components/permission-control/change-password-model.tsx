"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const router = useRouter()

  if (!isOpen) return null

  const handleChangeNow = () => {
    onClose()
    router.push('/settings/password-settings')
  }

  const handleLater = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50">
      <div className="w-full max-w-md rounded-lg border bg-white shadow-lg border-gray-500">
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-center">Change Default Password</h2>
          <p className="mb-6 text-gray-600 text-center">
            You are currently using a default password. For security reasons, we recommend changing it from settings.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleChangeNow} 
              className="bg-primary hover:bg-secondary cursor-pointer h-11 px-6 w-32"
            >
              Change Now
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLater} 
              className="px-6 bg-transparent h-11 hover:bg-secondary hover:text-white cursor-pointer w-32"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check for default password
export const useDefaultPasswordCheck = () => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkDefaultPassword = () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(window.atob(base64))
          console.log(payload.defaultPassword)
          if (payload.defaultPassword === true) {
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('Error checking default password:', error)
      }
    }

    checkDefaultPassword()
  }, [])

  return { showModal, setShowModal }
}

export default ChangePasswordModal