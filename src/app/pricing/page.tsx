'use client'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
    createRazorpayInstance,
    loadRazorpayScript,
} from '@/lib/razorpay-loader'
import { Plan } from '@/types/payment.types'
import { apiClient } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FeatureSection } from './_components/feature-section'

const PricingPage = () => {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [planType, setPlanType] = useState<'individual' | 'company'>(
    'individual'
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/payments/plans')

      if (response.data.success) {
        setPlans(response.data.data)
      } else {
        setError('Failed to fetch plans')
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      setError('Failed to load pricing plans')
      toast.error('Failed to load pricing plans')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  // Filter plans based on selected plan type
  const filteredPlans = plans.filter((plan) => plan.category === planType)
  const standardPlan = filteredPlans.find((plan) => plan.tier === 'standard')
  const premiumPlan = filteredPlans.find((plan) => plan.tier === 'premium')

  const getPrice = (plan: Plan | undefined) => {
    if (!plan) return 0
    return billingCycle === 'monthly'
      ? parseFloat(plan.monthlyAmount)
      : parseFloat(plan.yearlyAmount)
  }

  const handlePayment = async (plan: Plan | undefined) => {
    if (!plan) return

    try {
      setProcessingPlanId(plan.id)
      console.log('Initiating payment for:', {
        planId: plan.id,
        planName: plan.displayName,
        billingCycle,
        amount: getPrice(plan),
      })

      // Create subscription order
      const orderResponse = await apiClient.post('/payments/create-order', {
        planId: plan.id,
        billingCycle,
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

            // Validate required parameters
            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error('Missing payment verification parameters')
            }

            // Verify payment
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
              toast.success(
                '🎉 Subscription activated successfully! Welcome to RealEase Premium.'
              )

              // Redirect to homepage after 2 seconds
              setTimeout(() => {
                router.push('/')
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={fetchPlans}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`px-5 py-[28px] lg:px-4 lg:py-[46px]`}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-left lg:text-center">
          <h1 className="mb-4 text-[32px] leading-[120%] font-semibold lg:mb-8 lg:text-5xl">
            A Plan For Every Kind Of Owner
          </h1>
          <p className="text-lg leading-relaxed">
            A simple, secure system to organise, analyse, and{' '}
            <br className="hidden lg:block" /> access your land-related data –
            effortlessly
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="mb-8 flex justify-start lg:mb-12 lg:justify-center">
          <div className="flex w-full flex-row gap-1 sm:w-auto sm:flex-row lg:gap-4">
            {/* Billing Cycle Toggle */}
            <div className="flex h-12 w-full rounded-lg bg-white p-1 sm:w-auto">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                  billingCycle === 'yearly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Plan Type Toggle */}
            <div className="flex h-12 w-full rounded-lg bg-white p-1 sm:w-auto">
              <button
                onClick={() => setPlanType('individual')}
                className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                  planType === 'individual'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setPlanType('company')}
                className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                  planType === 'company'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500'
                }`}
              >
                Company
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-stretch">
        {/* Standard Plan */}
        {standardPlan && (
          <Card className="flex flex-col border border-gray-300 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {standardPlan.displayName}
              </CardTitle>
              <CardDescription className="text-md leading-relaxed text-gray-600">
                {standardPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{getPrice(standardPlan).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              {billingCycle === 'yearly' && standardPlan.savings && (
                <div className="text-sm font-medium text-green-600">
                  Save {standardPlan.savings.percentage}% (₹
                  {standardPlan.savings.amount.toLocaleString('en-IN')})
                </div>
              )}

              <Button
                onClick={() => handlePayment(standardPlan)}
                disabled={processingPlanId === standardPlan.id}
                className="hover:bg-secondary text-secondary text-md h-11 w-full cursor-pointer border border-gray-400 bg-white font-semibold hover:text-white"
              >
                {processingPlanId === standardPlan.id
                  ? 'Processing...'
                  : 'Choose Plan'}
              </Button>

              <div className="flex-1">
                <button
                  onClick={toggleExpansion}
                  className="flex w-full items-center justify-between py-2 text-left"
                >
                  <span className="text-secondary text-lg font-semibold">
                    Features included
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 mt-4 min-h-0 space-y-4 duration-200">
                    {Object.entries(standardPlan.features).map(
                      ([category, features]) => (
                        <FeatureSection
                          key={category}
                          title={category}
                          features={features}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Plan */}
        {premiumPlan && (
          <Card className="flex flex-col border border-gray-300 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {premiumPlan.displayName}
                </CardTitle>

                {planType === 'company' && billingCycle === 'yearly' && (
                  <div className="rounded-3xl bg-[#A2CFE33D] px-2 py-1 text-sm text-[#5C9FAD] sm:px-4">
                    Popular
                  </div>
                )}
              </div>

              <CardDescription className="text-md leading-relaxed text-gray-600">
                {premiumPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{getPrice(premiumPlan).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              {billingCycle === 'yearly' && premiumPlan.savings && (
                <div className="text-sm font-medium text-green-600">
                  Save {premiumPlan.savings.percentage}% (₹
                  {premiumPlan.savings.amount.toLocaleString('en-IN')})
                </div>
              )}

              <Button
                onClick={() => handlePayment(premiumPlan)}
                disabled={processingPlanId === premiumPlan.id}
                className="hover:bg-secondary text-secondary text-md h-11 w-full cursor-pointer border border-gray-400 bg-white font-semibold hover:text-white"
              >
                {processingPlanId === premiumPlan.id
                  ? 'Processing...'
                  : 'Choose Plan'}
              </Button>

              <div className="flex-1">
                <button
                  onClick={toggleExpansion}
                  className="flex w-full items-center justify-between py-2 text-left"
                >
                  <span className="text-secondary text-lg font-semibold">
                    Features included
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 mt-4 min-h-0 space-y-4 duration-200">
                    {Object.entries(premiumPlan.features).map(
                      ([category, features]) => (
                        <FeatureSection
                          key={category}
                          title={category}
                          features={features}
                          isPremium
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PricingPage
