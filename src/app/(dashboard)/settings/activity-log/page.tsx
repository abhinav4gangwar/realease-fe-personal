'use client'

import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'

import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
  parse,
} from 'date-fns'
import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { toast } from 'sonner'

export interface Activity {
  id: number
  time: string
  name: string
  activity: string
  actionType: string
  resourceType: string
  userType: string
  ipAddress: string
  metadata: any
}

export interface DayLog {
  date: string
  activities: Activity[]
}

export interface ActivityLogsResponse {
  success: boolean
  data: {
    logs: DayLog[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
    dateRange: {
      startDate: string
      endDate: string
      days: number
    }
  }
}

const ActivityLogPage = () => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const [appliedRange, setAppliedRange] = useState<{ from?: Date; to?: Date }>(
    {}
  )
  const [activityLogs, setActivityLogs] = useState<DayLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const avatarColors = ['#C1B5E4', '#A2CFE3', '#FFEF64']
  const statusColors = ['#38AD9A', '#DE5753']

  const getRandomColor = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)]

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<ActivityLogsResponse>(
        '/settings/access-logs'
      )

      if (response.data.success && response.data.data.logs) {
        setActivityLogs(response.data.data.logs)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch activity logs'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  // Format dates dynamically
  const formatReadableDate = (dateString: string) => {
    const date = parse(dateString, 'dd/MM/yyyy', new Date())

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
      const logDate = parse(log.date, 'dd/MM/yyyy', new Date())
      return (
        logDate >= appliedRange.from! &&
        logDate <= appliedRange.to!
      )
    })
  }, [appliedRange, activityLogs])

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between pb-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Activity Log
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Loading activity logs...</p>
        </div>
      </div>
    )
  }

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
      {filteredLogs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">No activity logs found</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-6 py-6">
          {filteredLogs.map((day) => (
            <div
              key={day.date}
              className="border border-gray-300 bg-white shadow-md"
            >
              <div className="bg-[#F8F8F8] p-4">
                <h1 className="text-lg">{formatReadableDate(day.date)}</h1>
              </div>

              <div className="flex flex-col gap-5 px-4 py-7">
                {day.activities.map((a) => {
                  const initial = a.name.charAt(0).toUpperCase()
                  const avatarColor = getRandomColor(avatarColors)
                  const statusColor = getRandomColor(statusColors)

                  return (
                    <div
                      key={a.id}
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

                      <div className="flex gap-5 items-center">
                        <p className="font-medium">{a.name}</p>
                        <p className="text-md text-gray-500">{a.activity}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActivityLogPage