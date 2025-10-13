'use client'

import { format } from 'date-fns'

interface PaymentHistoryCardProps {
  id: number
  amount: string
  billingCycle: string
  status: string
  subscriptionStartDate: string
  subscriptionEndDate: string
  createdAt: string
  plan: {
    id: number
    displayName: string
    category: string
    tier: string
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return format(date, 'dd MMM yyyy')
}

export const PaymentHistoryCard = ({
  amount,
  billingCycle,
  status,
  subscriptionStartDate,
  subscriptionEndDate,
  createdAt,
  plan,
}: PaymentHistoryCardProps) => {
  return (
    <div className="flex items-center justify-between p-5 border-b border-gray-300">
      <div>
        <h2 className="text-secondary pb-1 text-sm font-medium">
          {plan.displayName}
        </h2>
        <p className="text-xs text-gray-600 capitalize">
          {billingCycle} plan • {status}
        </p>
        <p className="mt-1 text-xs text-[#9B9B9D]">
          {formatDate(subscriptionStartDate)} → {formatDate(subscriptionEndDate)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-base font-semibold text-gray-800">
          ₹{parseFloat(amount).toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
      </div>
    </div>
  )
}
