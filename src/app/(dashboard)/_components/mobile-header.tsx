import { Bell, CircleUser } from "lucide-react"
import Image from "next/image"

const MobileHeader = () => {
  return (
    <header className="z-40 bg-white px-6 py-4 shadow-sm lg:hidden block fixed w-full top-0">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        

        <div className="block lg:hidden">
          <Image
            src="/assets/logo-black.png"
            alt="logo"
            height={30}
            width={110}
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6 lg:pr-8">
          <Bell className="h-7 w-7" />
          <CircleUser className="h-8 w-8" />
        </div>
      </div>
    </header>
  )
}

export default MobileHeader
