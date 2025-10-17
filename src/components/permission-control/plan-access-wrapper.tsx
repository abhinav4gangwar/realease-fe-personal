"use client"
import { useGlobalContextProvider } from '@/providers/global-context'
import { Crown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface PlanAccessWrapperProps {
  featureId: string
  children: React.ReactElement
  upgradeMessage?: string
  showCrown?: boolean
  crownPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  blockInteraction?: boolean
}

export const PlanAccessWrapper: React.FC<PlanAccessWrapperProps> = ({
  featureId,
  children,
  upgradeMessage = "You don't have access to this feature in your current plan. Upgrade to unlock!",
  showCrown = true,
  crownPosition = 'top-right',
}) => {
  const { planAccessValues } = useGlobalContextProvider()
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const hasAccess = planAccessValues.includes(featureId)

  const getCrownPositionClasses = () => {
    switch (crownPosition) {
      case 'top-left':
        return 'top-1 left-1'
      case 'bottom-right':
        return 'bottom-1 right-1'
      case 'bottom-left':
        return 'bottom-1 left-1'
      default:
        return 'top-1 right-1'
    }
  }

  const handleRestrictedClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault()
      e.stopPropagation()
      setShowModal(true)
    }
  }

  const handleUpgrade = () => {
    router.push("/settings/account-details/subscription")
    setShowModal(false)
  }

  if (hasAccess) {
    return children
  }


  return (
    <>
      <div className="relative inline-block">
        {/* Overlay to block interaction */}
        <div
          className="absolute inset-0 z-20 cursor-not-allowed"
          onClick={handleRestrictedClick}
          onMouseDown={handleRestrictedClick}
          onMouseUp={handleRestrictedClick}
        />

        {/* Original content with reduced opacity */}
        <div className="pointer-events-none opacity-60">{children}</div>

        {showCrown && (
          <div
            className={`absolute ${getCrownPositionClasses()} pointer-events-none z-30`}
          >
            <Crown
              className="h-4 w-4 fill-yellow-400 text-yellow-500 drop-shadow-md "
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600">
                <Crown className="h-8 w-8 fill-white text-white" />
              </div>

              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Premium Feature
              </h3>

              <p className="mb-6 text-gray-600">{upgradeMessage}</p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-md transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
