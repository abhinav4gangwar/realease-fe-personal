import { Button } from "@/components/ui/button"
import AccessControlStateToggle from "./access-control-state-toggle"

const PermissionsList = () => {
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
          <Button className="h-12 cursor-pointer hover:bg-white hover:text-primary">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PermissionsList
