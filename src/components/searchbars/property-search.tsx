import { Search } from 'lucide-react'
import { Input } from '../ui/input'

const PropertySearch = () => {
  return (
    <div className="mx-8 hidden max-w-6xl flex-1 lg:block">
      <div className="relative">
        <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search Properties"
          className="h-12 w-full pl-10"
        />
      </div>
    </div>
  )
}

export default PropertySearch
