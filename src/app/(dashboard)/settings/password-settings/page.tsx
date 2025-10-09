'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import OldPasswordModel from '../_components/password-settings-component/old-password-model'

const PasswordSettingsPage = () => {
  const [isOldPasswordModelOpen, setIsPasswordModelOpen] = useState(false)
  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <LockKeyhole className="text-primary" />
        <h1 className="text-lg">Password</h1>
      </div>

      {/* content */}
      <div className="flex items-center justify-between bg-white p-5">
        <p className="text-[#4E4F54]">
          A log in password has been set for this account.
        </p>

        <Button
          className="bg-secondary h-11 cursor-pointer"
          onClick={() => setIsPasswordModelOpen(true)}
        >
          Change <ArrowRight />
        </Button>
      </div>

      <OldPasswordModel
        isOpen={isOldPasswordModelOpen}
        onClose={() => setIsPasswordModelOpen(false)}
      />
    </div>
  )
}

export default PasswordSettingsPage
