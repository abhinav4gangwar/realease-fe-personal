import { Check } from 'lucide-react'

export const FeatureSection = ({
  title,
  features,
  isPremium = false,
}: {
  title: string
  features: string[]
  isPremium?: boolean
}) => (
  <div className="mb-4">
    <h4 className="mb-2 font-medium text-gray-900">{title}</h4>
    <div className="space-y-1">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-2">
          <Check
            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
              isPremium ? 'text-[#FFD150]' : 'text-green-600'
            }`}
          />
          <span className="text-sm text-gray-600">{feature}</span>
        </div>
      ))}
    </div>
  </div>
)
