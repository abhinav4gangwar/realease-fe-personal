import propertiesData from '../../../lib/properties.dummy.json'
import PropertiesViewer from './_components/properties-viewer'

const Propertiespage = () => {
  return (
    <div>
      <PropertiesViewer allProperties={propertiesData.allProperties} />
    </div>
  )
}

export default Propertiespage
