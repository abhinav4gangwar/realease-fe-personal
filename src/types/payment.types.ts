export interface Plan {
  id: number;
  name: string;
  displayName: string;
  category: string;
  tier: string;
  monthlyAmount: string;
  yearlyAmount: string;
  features: Record<string, string[]>;
  description: string;
  sortOrder: number;
  savings?: {
    amount: number;
    percentage: number;
  };
}


export interface SubscriptionData {
  subscription: {
    status: string
    billingCycle: string
    isActive: boolean
    isExpired: boolean
    nextBillingDate: string | null
    trialEndDate: string | null
    daysRemaining: number | null
  }
  currentPlan: {
    id: number
    displayName: string
    category: string
    tier: string
    description: string
  } | null
}