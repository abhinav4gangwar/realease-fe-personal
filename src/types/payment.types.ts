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
