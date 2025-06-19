import AddWidgetButton from "./_components/add-widget-menu";
import QuickActionMenu from "./_components/quick-action-menu";

export default function Home() {
  return (
    <div className="">
      <div className="flex justify-between">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Dashboard
        </div>

        <div className="flex gap-6">
        <AddWidgetButton />
         <QuickActionMenu />
        </div>
      </div>
    </div>
  )
}
