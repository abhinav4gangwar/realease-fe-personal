import MapPage from './_components/map-page'
import MobileMapPage from './_components/mobile-map-page'

const MapViewPage = () => {
  return (
    <div>
      <div className='hidden lg:block'><MapPage /></div>
      <div className='lg:hidden block pt-14'><MobileMapPage /></div>
    </div>
  )
}

export default MapViewPage
