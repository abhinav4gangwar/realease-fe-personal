import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const MapView = dynamic(() => import('@/components/shared/map-view').then(m => m.MapView), {
  ssr: false,
})

export const MiniMapWidget = () => {
  return (
     <Card className="h-full border-none pb-0">
      <CardHeader>
        <CardTitle className="text-secondary text-lg font-semibold">
          Mini Map View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapView height="500px" zoom={12} />
      </CardContent>
    </Card>
  )
}

export const PreviewMiniMapWidget = () => {
  return (
    <Card className="h-full border-gray-200 pb-0 group relative">
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-[#5C9FAD]/25 text-[#5C9FAD] transition-opacity group-hover:flex">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="text-secondary h-2 pb-3 text-sm font-semibold">
          Mini Map View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[100px] w-full overflow-hidden">
          <Image
            src="/assets/map.png"
            alt="Map view"
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
    </Card>
  )
}
