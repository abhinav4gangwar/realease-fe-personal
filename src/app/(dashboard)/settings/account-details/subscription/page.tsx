import { Button } from '@/components/ui/button'
import { ArrowRight, SquareCheckBig } from 'lucide-react'

const SubscriptionPage = () => {
  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <SquareCheckBig className="text-primary" />
        <h1 className="text-lg">Active Subscription</h1>
      </div>

      {/* content */}
      <div className="flex items-center justify-between bg-white p-5">
        <div>
            <h1 className='text-lg text-secondary pb-2'>Company - Standard</h1>
          <p className="text-sm text-[#9B9B9D]">Expiring on Aug 12, 2025</p>
        </div>

        <Button className="bg-primary h-11 cursor-pointer">
          Upgrade <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

export default SubscriptionPage
