import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import AccessControlStateToggle from './access-control-state-toggle'

const UsersList = () => {
  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Roles
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AccessControlStateToggle />

          <Button className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white">
            <UserPlus className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UsersList
