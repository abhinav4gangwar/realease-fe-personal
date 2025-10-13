'use client'
import { Button } from '@/components/ui/button'
import { SubscriptionData } from '@/types/payment.types'
import { apiClient } from '@/utils/api'
import { ArrowRight, SquareCheckBig } from 'lucide-react'
import { useEffect, useState } from 'react'

import { toast } from 'sonner'

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/payments/subscription')

      if (response.data.success && response.data.data) {
        setSubscription(response.data.data)
      } else {
        setError('No active subscription found')
      }
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err)
      setError('Failed to load subscription details')
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600'
      case 'trial':
        return 'text-blue-600'
      case 'past_due':
        return 'text-orange-600'
      case 'canceled':
      case 'expired':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="border border-gray-300 shadow-md">
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <SquareCheckBig className="text-primary" />
          <h1 className="text-lg">Subscription Details</h1>
        </div>
        <div className="flex items-center justify-center bg-white p-8">
          <div className="text-center">
            <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-sm text-gray-600">Loading subscription...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !subscription || !subscription.currentPlan) {
    return (
      <div className="border border-gray-300 shadow-md">
        <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
          <SquareCheckBig className="text-gray-400" />
          <h1 className="text-lg">No Active Subscription</h1>
        </div>
        <div className="bg-white p-5">
          <p className="mb-4 text-sm text-gray-600">
            {error ||
              'You do not have an active subscription. Subscribe to a plan to get started.'}
          </p>
          <Button
            onClick={() => (window.location.href = '/pricing')}
            className="bg-primary h-11 cursor-pointer"
          >
            View Plans <ArrowRight />
          </Button>
        </div>
      </div>
    )
  }

  const { subscription: subDetails, currentPlan } = subscription
  const isExpiringSoon =
    subDetails.daysRemaining !== null && subDetails.daysRemaining <= 30

  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <SquareCheckBig className="text-primary" />
        <h1 className="text-lg">
          {subDetails.isActive ? 'Active Subscription' : 'Subscription Status'}
        </h1>
        <span
          className={`ml-auto text-sm font-medium capitalize ${getStatusColor(subDetails.status)}`}
        >
          {subDetails.status}
        </span>
      </div>

      {/* content */}
      <div className="flex items-center justify-between bg-white p-5">
        <div>
          <h1 className="text-secondary pb-2 text-lg">
            {currentPlan.displayName}
          </h1>

          {subDetails.status === 'trial' && subDetails.trialEndDate ? (
            <p className="text-sm text-[#9B9B9D]">
              Trial ending on {formatDate(subDetails.trialEndDate)}
            </p>
          ) : subDetails.isActive && subDetails.nextBillingDate ? (
            <>
              <p className="text-sm text-[#9B9B9D]">
                {subDetails.isExpired ? 'Expired on' : 'Renewing on'}{' '}
                {formatDate(subDetails.nextBillingDate)}
              </p>
              {isExpiringSoon && subDetails.daysRemaining !== null && (
                <p className="mt-1 text-xs text-orange-600">
                  {subDetails.daysRemaining} days remaining
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#9B9B9D]">
              Billing cycle: {subDetails.billingCycle || 'N/A'}
            </p>
          )}
        </div>

        <Button className="bg-primary h-11 cursor-pointer">
          Upgrade <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

export default SubscriptionPage
