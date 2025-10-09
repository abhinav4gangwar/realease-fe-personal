import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

const timeZones = Intl.supportedValuesOf('timeZone')

function getReadableTimeZoneName(timeZone: string) {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone,
      timeZoneName: 'long',
    })
    const parts = formatter.formatToParts(new Date())
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value
    return tzName || timeZone
  } catch {
    return timeZone
  }
}

const TimeZoneModel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Precompute readable names
  const zonesWithNames = useMemo(
    () =>
      timeZones.map((tz) => ({
        id: tz,
        name: getReadableTimeZoneName(tz),
      })),
    []
  )

  // Filter by search
  const filteredZones = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return zonesWithNames.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.id.toLowerCase().includes(q)
    )
  }, [searchQuery, zonesWithNames])

  const handleSave = () => {
    console.log('Selected Timezone:', selectedZone)
    onClose()
  }

  const handleCancel = () => {
    setSelectedZone('')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[550px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="truncate pl-1 text-xl font-semibold">
                  Select Timezone
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <Input
                type="text"
                placeholder="Search time zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-full"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <ul className="space-y-2">
                {filteredZones.map((zone) => (
                  <li
                    key={zone.id}
                    className={`cursor-pointer rounded-md p-3 transition-colors ${
                      selectedZone === zone.id
                        ? ' bg-[#A2CFE333]'
                        : ' hover:bg-[#A2CFE333]'
                    }`}
                    onClick={() => setSelectedZone(zone.id)}
                  >
                    <div className="font-semibold text-md">{zone.name}</div>
                    {/* <div className="text-sm text-gray-500">{zone.id}</div> */}
                  </li>
                ))}
                {filteredZones.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-5">
                    No time zones found.
                  </p>
                )}
              </ul>
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="bg-white border border-gray-400 text-secondary hover:text-white h-11 w-[150px] cursor-pointer px-6 hover:bg-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    disabled={!selectedZone}
                    className="bg-secondary hover:text-secondary h-11 w-[150px] cursor-pointer px-6 hover:bg-white hover:border"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TimeZoneModel
