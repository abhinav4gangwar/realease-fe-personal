"use client"
import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'
import { Lock } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubscriptionPopupProps {
  onClose?: () => void
}

export const SubscriptionPopup = ({ onClose }: SubscriptionPopupProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true)

  // Check subscription on mount and whenever pathname changes
  useEffect(() => {
    checkSubscriptionStatus()
  }, [pathname])

  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/payments/subscription')

      if (response.data.success && response.data.data) {
        const { subscription, currentPlan } = response.data.data
        
        const isActive = subscription?.isActive && currentPlan !== null
        setHasActiveSubscription(isActive)
        
        if (!isActive) {
          setIsVisible(true)
        }
      } else {
        setHasActiveSubscription(false)
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
      setHasActiveSubscription(false)
      setIsVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPlans = () => {
    router.push('/pricing')
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (isLoading || hasActiveSubscription || !isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-400 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl text-secondary font-semibold">
              Subscription Required
            </h2>
          </div>
          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="h-8 w-8"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button> */}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <p className="text-base font-semibold text-secondary mb-2">
              No Active Subscription Found
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You don&#39;t have an active subscription plan. Please subscribe to a plan to continue using the dashboard and access all features.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <Button 
            onClick={handleViewPlans} 
            className="bg-primary hover:bg-secondary cursor-pointer h-11 px-6"
          >
            View Pricing Plans
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPopup