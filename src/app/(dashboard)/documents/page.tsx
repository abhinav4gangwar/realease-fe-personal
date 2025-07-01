import { QUICK_ACTIONS_DOCS } from "@/lib/constants"
import QuickActionMenu from "../_components/quick-action-menu"

const Propertiespage = () => {
  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Documents
        </div>

        <div className="flex gap-6">
        filter buttons

        <QuickActionMenu quickActionOptions={QUICK_ACTIONS_DOCS} />
        </div>
      </div>

      <div></div>
    </div>
  )
}

export default Propertiespage
