'use client'
import { Button } from '@/components/ui/button'
import { useGlobalContextProvider } from '@/providers/global-context'
import { ArrowRight, SquareUser } from 'lucide-react'
import { useState } from 'react'
import AddressModel from '../_components/account-details-components/address-model'
import NameModel from '../_components/account-details-components/name-model'
import PhoneNumberModel from '../_components/account-details-components/phone-number-model'

const AccountDetailsPage = () => {
  const { accountDetails } = useGlobalContextProvider()
  const [isNameModelOpen, setIsNameModelOpen] = useState(false)
  const [isAddressModelOpen, setIsAddressModelOpen] = useState(false)
  const [isPhoneModelOpen, setIsPhoneModelOpen] = useState(false)
  const [isEmailModelOpen, setIsEmailModelOpen] = useState(false)

  if (!accountDetails) {
    return (
      <div className="border border-gray-300 shadow-md">
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <SquareUser className="text-primary" />
          <h1 className="text-lg">Personal Settings</h1>
        </div>
        <div className="flex items-center justify-center bg-white px-6 py-10">
          <p className="text-gray-400">Loading account details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <SquareUser className="text-primary" />
        <h1 className="text-lg">Personal Settings</h1>
      </div>

      {/* content */}
      <div className="flex flex-col space-y-6 bg-white px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="w-xs">Name</h1>
          <p className="flex-1 text-left font-normal text-gray-400">
            {accountDetails.name || 'Not Provided'}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsNameModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="w-xs">Address</h1>
          <p className="flex-1 text-left font-normal text-gray-400">
            {accountDetails.address.addressLine1 || accountDetails.address.addressLine2 || accountDetails.address.city || accountDetails.address.state || accountDetails.address.country || accountDetails.address.zipCode
              ? `${accountDetails.address.addressLine1 || ''}${accountDetails.address.addressLine2 ? ', ' + accountDetails.address.addressLine2 : ''}${accountDetails.address.city ? ', ' + accountDetails.address.city : ''}${accountDetails.address.state ? ', ' + accountDetails.address.state : ''}${accountDetails.address.country ? ', ' + accountDetails.address.country : ''}${accountDetails.address.zipCode ? ', ' + accountDetails.address.zipCode : ''}`
              : 'Not Provided'}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsAddressModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="w-xs">Phone Number</h1>
          <p className="flex-1 text-left font-normal text-gray-400">
            {accountDetails.phone || 'Not Provided'}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsPhoneModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="w-xs">Email Address</h1>
          <p className="flex-1 text-left font-normal text-gray-400">
            {accountDetails.email || 'Not Provided'}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsEmailModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      <NameModel
        isOpen={isNameModelOpen}
        onClose={() => setIsNameModelOpen(false)}
      />
      <AddressModel
        isOpen={isAddressModelOpen}
        onClose={() => setIsAddressModelOpen(false)}
      />
      <PhoneNumberModel
        isOpen={isPhoneModelOpen}
        onClose={() => setIsPhoneModelOpen(false)}
      />
    </div>
  )
}

export default AccountDetailsPage