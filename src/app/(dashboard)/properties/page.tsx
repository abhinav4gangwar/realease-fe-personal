import propertiesData from '../../../lib/properties.dummy.json'
import PropertiesViewer from './_components/properties-viewer'
import MobilePropertiesViewer from './_mobile-properties-components/mobile-properties-viewer'

const Propertiespage = () => {
  return (
    <div>
      {/* for desktop */}
      <div className="hidden lg:block">
        <PropertiesViewer allProperties={propertiesData.allProperties} />
      </div>

      {/* for mobile */}
      <div className="block pt-14 lg:hidden">
        <MobilePropertiesViewer allProperties={propertiesData.allProperties} />
      </div>
    </div>
  )
}

export default Propertiespage
