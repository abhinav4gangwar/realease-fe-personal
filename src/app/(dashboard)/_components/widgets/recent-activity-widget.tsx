import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/utils/api'
import { useEffect, useState } from 'react'
import {
  Activity,
  ActivityLogsResponse,
  DayLog,
} from '../../settings/activity-log/page'

const RecentActivityWidget = () => {
  const [activityLogs, setActivityLogs] = useState<DayLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      console.log(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  const recentActivities: Activity[] = activityLogs.flatMap(
    (log) => log.activities
  )

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-secondary h-2 text-lg font-semibold">
          Recent Activity Feed
        </CardTitle>
      </CardHeader>

      <CardContent className="h-28 space-y-1 overflow-y-auto">
        {isLoading && (
          <div className="text-sm text-gray-400">Loading activity...</div>
        )}

        {!isLoading && recentActivities.length === 0 && (
          <div className="text-sm text-gray-400">No recent activity found</div>
        )}

        {!isLoading &&
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center py-1 text-sm text-gray-600"
            >
              <span className="font-medium text-blue-500">{activity.name}</span>
              <span className="px-1">{activity.activity}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

export default RecentActivityWidget
