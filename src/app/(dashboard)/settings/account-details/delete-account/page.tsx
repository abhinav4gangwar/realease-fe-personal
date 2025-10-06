'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import DeletePasswordModel from '../../_components/delete-account-components/delete-password-model'

const DeleteAccountPage = () => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isDeletePasswordModelOpen, setIsDeletePasswordModelOpen] =
    useState(false)
  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <Trash2 className="text-primary" />
        <h1 className="text-lg">Delete RealEase Account</h1>
      </div>

      {/* content */}
      <div className="flex items-center justify-between bg-white p-5">
        <p className="text-[#4E4F54]">
          Permanently delete your RealEase account and all associated data from
          the RealEase App and servers. This action is irreversible, so please
          continue with caution.
        </p>

        <Button
          className="h-11 cursor-pointer bg-[#E2364D]"
          onClick={() => setIsConfirmDeleteOpen(true)}
        >
          Delete Account <ArrowRight />
        </Button>
      </div>

      <div>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-lg border border-gray-500 bg-white shadow-lg">
              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between">
                  <Image
                    src="/assets/delete-img.svg"
                    height={80}
                    width={80}
                    alt="delete imgae"
                  />
                  <h2 className="m-5 text-left text-xl font-semibold">
                    Are you sure you wish to Delete your Account?
                  </h2>
                </div>

                <p className="mt-3 mb-6 text-left text-gray-600">
                  This action is irreversible, so please continue with caution.
                </p>

                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    className="hover:bg-secondary h-11 w-[190px] cursor-pointer bg-transparent px-6 hover:text-white"
                    onClick={() => {
                      setIsConfirmDeleteOpen(false)
                      setIsDeletePasswordModelOpen(true)
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    className="bg-primary hover:bg-secondary h-11 w-[190px] cursor-pointer px-6"
                    onClick={() => setIsConfirmDeleteOpen(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeletePasswordModel
        isOpen={isDeletePasswordModelOpen}
        onClose={() => setIsDeletePasswordModelOpen(false)}
      />
    </div>
  )
}

export default DeleteAccountPage
