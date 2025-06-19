import AddWidgetButton from './_components/add-widget-menu'
import QuickActionMenu from './_components/quick-action-menu'
import WidgetSection from './_components/widgets/widget-section'

export default function Home() {
  return (
    <div className="">
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Dashboard
        </div>

        <div className="flex gap-6">
          <AddWidgetButton />
          <QuickActionMenu />
        </div>
      </div>

      <div className="py-2">
        <WidgetSection />
      </div>
    </div>
  )
}
