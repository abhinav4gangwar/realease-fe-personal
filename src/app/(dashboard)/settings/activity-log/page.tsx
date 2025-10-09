'use client'

import { Button } from '@/components/ui/button'
import { activityLogs } from '@/lib/activity-log.dummy'
import {
    differenceInCalendarDays,
    format,
    isToday,
    isYesterday,
    parse,
} from 'date-fns'
import { Calendar } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

const ActivityLogPage = () => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const [appliedRange, setAppliedRange] = useState<{ from?: Date; to?: Date }>(
    {}
  )

  const avatarColors = ['#C1B5E4', '#A2CFE3', '#FFEF64']
  const statusColors = ['#38AD9A', '#DE5753']

  const getRandomColor = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)]

  // Format dates dynamically
  const formatReadableDate = (dateString: string) => {
    const date = parse(dateString, 'dd-MM-yyyy', new Date())

    if (isToday(date)) return `Today - ${format(date, 'EEEE d MMMM yyyy')}`
    else if (isYesterday(date))
      return `Yesterday - ${format(date, 'EEEE d MMMM yyyy')}`
    else {
      const diff = differenceInCalendarDays(new Date(), date)
      if (diff <= 6) return `${format(date, 'EEEE d MMMM yyyy')}`
      return format(date, 'd MMMM yyyy')
    }
  }

  // Filter activities based on applied range
  const filteredLogs = useMemo(() => {
    if (!appliedRange.from || !appliedRange.to) return activityLogs
    return activityLogs.filter((log) => {
      const logDate = parse(log.date, 'dd-MM-yyyy', new Date())
      return logDate >= appliedRange.from && logDate <= appliedRange.to
    })
  }, [appliedRange])

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between pb-4">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Activity Log
        </div>

        <div className="relative">
          <Button
            onClick={() => setShowCalendar((prev) => !prev)}
            className="text-secondary hover:bg-secondary h-12 cursor-pointer rounded-full border border-gray-300 bg-white font-semibold hover:text-white"
          >
            <Calendar className="text-primary mr-2 size-6" /> Select Dates
          </Button>

          {showCalendar && (
            <div className="absolute right-0 z-50 mt-2 rounded-md border bg-white p-4 shadow-lg">
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setAppliedRange(selectedRange)
                    setShowCalendar(false)
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRange({})
                    setAppliedRange({})
                    setShowCalendar(false)
                  }}
                  variant="outline"
                  className="text-secondary border border-gray-300 hover:bg-gray-100"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Sections */}
      <div className="flex flex-col space-y-6 py-6">
        {filteredLogs.map((day) => (
          <div
            key={day.date}
            className="border border-gray-300 bg-white shadow-md"
          >
            <div className="bg-[#F8F8F8] p-4">
              <h1 className="text-lg">{formatReadableDate(day.date)}</h1>
            </div>

            <div className="flex flex-col gap-4 px-4 py-7">
              {day.activities.map((a, i) => {
                const initial = a.name.charAt(0).toUpperCase()
                const avatarColor = getRandomColor(avatarColors)
                const statusColor = getRandomColor(statusColors)

                return (
                  <div
                    key={i}
                    className="text-md flex items-center gap-2 text-[#4E4F54]"
                  >
                    <p className="w-16 text-right text-[#9B9B9D]">{a.time}</p>

                    <div className="h-0.5 w-6 bg-[#9B9B9D]" />

                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    ></div>
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-center text-xl text-white"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initial}
                    </div>

                    <p className="w-28 truncate font-light text-gray-400">
                      {a.name}
                    </p>

                    <p className="flex-1 truncate">{a.activity}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityLogPage
