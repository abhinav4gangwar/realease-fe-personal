import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import MapPage from './_components/map-page'
import MobileMapPage from './_components/mobile-map-page'

const MapViewPage = () => {
  return (
    <PlanAccessWrapper featureId="MAP_VIEW_PORTFOLIO" className='w-full'>
      <div>
        <div className="hidden lg:block">
          <MapPage />
        </div>
        <div className="block pt-14 lg:hidden">
          <MobileMapPage />
        </div>
      </div>
    </PlanAccessWrapper>
  )
}

export default MapViewPage
