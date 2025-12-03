"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/utils/api"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"


// =========================
// Types
// =========================
interface RecentComment {
  id: number
  text: string
  author: {
    id: number
    name: string
    email: string
    type: string
  }
  resourceType: string
  resourceId: number
  resourceName: string
  parentId: number
  createdAt: string
  updatedAt: string
}

interface RecentCommentsResponse {
  success: boolean
  count: number
  comments: RecentComment[]
}

// =========================
// API Function
// =========================
const fetchRecentComments = async (count = 10) => {
  try {
    const response = await apiClient.get<RecentCommentsResponse>(
      `/dashboard/comments/recent?count=${count}`
    )

    if (response.data.success && response.data.comments) {
      return response.data.comments
    }
    return []
  } catch (error: any) {
    console.error(error.response?.data?.message || "Failed to fetch comments")
    return []
  }
}

// =========================
// FULL WIDGET
// =========================
export const RecentCommentWidget = () => {
  const [comments, setComments] = useState<RecentComment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const data = await fetchRecentComments(10)
      setComments(data)
      setIsLoading(false)
    }
    load()
  }, [])

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-secondary text-lg font-semibold">
          Recent Comments
        </CardTitle>
      </CardHeader>

      <CardContent className="h-24 overflow-y-auto space-y-1">
        {isLoading && <div className="text-sm text-gray-400">Loading...</div>}

        {!isLoading && comments.length === 0 && (
          <div className="text-sm text-gray-400">No recent comments</div>
        )}

        {comments.map((c) => (
          <div key={c.id} className="py-1 text-sm text-gray-600">
            <span className="font-medium">{c.author.name}</span>
            <span> commented on </span>

            <span className="cursor-pointer font-semibold text-[#5C9FAD] hover:text-blue-800">
              {c.resourceName}
            </span>

            <span className="text-primary cursor-pointer pl-1 font-semibold">
              {c.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// =========================
// PREVIEW / MINI WIDGET
// =========================
export const PreviewRecentCommentWidget = () => {
  const [comments, setComments] = useState<RecentComment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const data = await fetchRecentComments(10) 
      setComments(data)
      setIsLoading(false)
    }
    load()
  }, [])

  return (
    <Card className="group relative w-full border-gray-300 overflow-hidden">
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-[#5C9FAD]/25 text-[#5C9FAD] transition-opacity group-hover:flex">
        <Plus className="h-8 w-8 text-primary" />
      </div>

      <CardHeader>
        <CardTitle className="text-secondary text-sm font-semibold">
          Recent Comments
        </CardTitle>
      </CardHeader>

      <CardContent className="h-20 overflow-y-auto space-y-1">
        {isLoading && <div className="text-[12px] text-gray-400">Loading...</div>}

        {!isLoading && comments.length === 0 && (
          <div className="text-[12px] text-gray-400">No recent comments</div>
        )}

        {comments.map((c) => (
          <div key={c.id} className="text-[12px] text-gray-600">
            <span className="font-medium">{c.author.name}</span>
            <span> commented on </span>

            <span className="cursor-pointer font-semibold text-[#5C9FAD] hover:text-blue-800">
              {c.resourceName}
            </span>

            <span className="text-primary cursor-pointer pl-1 font-semibold">
              {c.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
