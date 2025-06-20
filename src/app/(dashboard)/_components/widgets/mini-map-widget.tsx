import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export const MiniMapWidget = () => {
  return (
    <Card className="h-full border-none pb-0">
      <CardHeader>
        <CardTitle className="text-secondary h-2 pb-3 text-lg font-semibold">
          Mini Map View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px] w-full overflow-hidden">
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

export const PreviewMiniMapWidget = () => {
  return (
    <Card className="h-full border-gray-200 pb-0">
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
