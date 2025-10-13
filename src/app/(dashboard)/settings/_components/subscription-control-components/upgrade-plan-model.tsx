'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  createRazorpayInstance,
  loadRazorpayScript,
} from '@/lib/razorpay-loader'
import { Plan, SubscriptionData } from '@/types/payment.types'
import { apiClient } from '@/utils/api'
import { ArrowLeft, ArrowRight, Check, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface UpgradePlanModalProps {
  subscription: SubscriptionData
  plans: Plan[]
  onBack: () => void
}

export const UpgradePlanModal = ({
  subscription,
  plans,
  onBack,
}: UpgradePlanModalProps) => {
  const router = useRouter()
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null)

  const { currentPlan, subscription: subDetails } = subscription

  // Initialize billing cycle based on current plan
  const initialBillingCycle =
    currentPlan?.tier === 'premium' && subDetails.billingCycle === 'monthly'
      ? 'yearly'
      : 'monthly'

  const [selectedBillingCycle, setSelectedBillingCycle] = useState<
    'monthly' | 'yearly'
  >(initialBillingCycle)

  // Determine the recommended upgrade plan
  const getRecommendedPlan = () => {
    if (!currentPlan) return null

    // If user has standard, recommend premium
    if (currentPlan.tier === 'standard') {
      return plans.find(
        (plan) =>
          plan.category === currentPlan.category && plan.tier === 'premium'
      )
    }

    // If user has premium monthly, recommend yearly of same plan
    if (
      currentPlan.tier === 'premium' &&
      subDetails.billingCycle === 'monthly'
    ) {
      return currentPlan
    }

    // If user already has premium yearly, show the same plan
    return currentPlan
  }

  const recommendedPlan = getRecommendedPlan()

  const getPrice = (plan: Plan, cycle: 'monthly' | 'yearly') => {
    return cycle === 'monthly'
      ? parseFloat(plan.monthlyAmount)
      : parseFloat(plan.yearlyAmount)
  }

  const handleUpgrade = async (plan: Plan) => {
    try {
      setProcessingPlanId(plan.id)
      console.log('Initiating upgrade:', {
        planId: plan.id,
        planName: plan.displayName,
        billingCycle: selectedBillingCycle,
        amount: getPrice(plan, selectedBillingCycle),
      })

      // Create subscription order
      const orderResponse = await apiClient.post('/payments/create-order', {
        planId: plan.id,
        billingCycle: selectedBillingCycle,
      })

      console.log('Order response:', orderResponse.data)

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order')
      }

      const orderData = orderResponse.data.data

      // Load Razorpay script
      await loadRazorpayScript()
      console.log('Razorpay script loaded')

      // Initialize Razorpay
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: orderData.subscription_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name || 'RealEase',
        description:
          orderData.description || `${plan.displayName} Subscription`,
        prefill: orderData.prefill || {},
        theme: orderData.theme || {
          color: '#3399cc',
        },
        notes: orderData.notes || {},
        handler: async function (response: any) {
          try {
            console.log('Payment response:', response)

            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error('Missing payment verification parameters')
            }

            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_subscription_id: response.razorpay_subscription_id,
              subscription_id: orderData.subscription_id,
            }

            console.log('Verifying payment:', verificationPayload)

            const verifyResponse = await apiClient.post(
              '/payments/verify',
              verificationPayload
            )

            console.log('Verification response:', verifyResponse.data)

            if (verifyResponse.data.success) {
              toast.success('🎉 Plan upgraded successfully!')

              // Reload the page to show updated subscription
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            } else {
              throw new Error(
                verifyResponse.data.message || 'Payment verification failed'
              )
            }
          } catch (error: any) {
            console.error('Payment verification failed:', error)
            toast.error(
              error.message ||
                'Payment verification failed. Please contact support.'
            )
          } finally {
            setProcessingPlanId(null)
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed')
            setProcessingPlanId(null)
            toast.info('Payment cancelled')
          },
        },
      }

      console.log('Opening Razorpay checkout...')
      const rzp = createRazorpayInstance(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setProcessingPlanId(null)
    }
  }

  const renderFeatureSection = (
    title: string,
    features: string[],
    isPremium = false
  ) => (
    <div key={title} className="mb-4">
      <h4 className="text-secondary mb-2 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isPremium ? 'text-primary' : 'text-gray-400'}`}
            />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 cursor-pointer"
          >
            <ArrowLeft className="size-6" />
          </Button>
          <h1 className="text-secondary text-2xl font-semibold">
            Choose Another Plan
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/pricing')}
          className="gap-2"
        >
          Explore All Plans
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Billing Cycle Toggle (only show if recommending yearly) */}
      {currentPlan?.tier === 'premium' &&
        subDetails.billingCycle === 'monthly' && (
          <div className="flex justify-center">
            <div className="flex h-12 rounded-lg border border-gray-300 bg-white p-1">
              <button
                onClick={() => setSelectedBillingCycle('monthly')}
                className={`cursor-pointer rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                  selectedBillingCycle === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedBillingCycle('yearly')}
                className={`cursor-pointer rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                  selectedBillingCycle === 'yearly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        )}

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        {currentPlan && (
          <Card className="border-2 border-gray-300 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {currentPlan.displayName}
                </CardTitle>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Current Plan
                </span>
              </div>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                {currentPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ₹
                  {getPrice(
                    currentPlan,
                    subDetails.billingCycle as 'monthly' | 'yearly'
                  ).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500">
                  /{subDetails.billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-secondary mb-4 text-lg font-semibold">
                  Features Included
                </h3>
                <div className="space-y-4">
                  {Object.entries(currentPlan.features).map(
                    ([category, features]) =>
                      renderFeatureSection(category, features, false)
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended/Upgrade Plan Card */}
        {recommendedPlan && (
          <Card className="border-primary relative border-2 bg-white shadow-lg">
            {currentPlan?.tier === 'standard' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary rounded-full px-4 py-1 text-sm font-medium text-white">
                  Recommended
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {recommendedPlan.displayName}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-gray-600">
                {recommendedPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ₹
                  {getPrice(
                    recommendedPlan,
                    selectedBillingCycle
                  ).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500">
                  /{selectedBillingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              {selectedBillingCycle === 'yearly' && recommendedPlan.savings && (
                <div className="text-sm font-medium text-green-600">
                  Save {recommendedPlan.savings.percentage}% (₹
                  {recommendedPlan.savings.amount.toLocaleString('en-IN')})
                </div>
              )}

              <Button
                onClick={() => handleUpgrade(recommendedPlan)}
                disabled={processingPlanId === recommendedPlan.id}
                className="bg-primary hover:bg-secondary h-12 w-full cursor-pointer font-semibold text-white"
              >
                {processingPlanId === recommendedPlan.id ? (
                  'Processing...'
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-secondary mb-4 text-lg font-semibold">
                  Features Included
                </h3>
                <div className="space-y-4">
                  {Object.entries(recommendedPlan.features).map(
                    ([category, features]) =>
                      renderFeatureSection(category, features, true)
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
