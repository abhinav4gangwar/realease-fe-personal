import { apiClient } from '@/utils/api'
import { Bell, Check, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '../ui/dropdown-menu'


interface Notification {
  id: number
  recipientId: number
  parentCustomerId: number
  actorId: number
  actorName: string
  type: string
  title: string
  message: string
  resourceType: string
  resourceId: number
  metadata: {
    fileNames?: string[]
    moreCount?: number
    propertyId?: number | null
    propertyName?: string | null
    documentCount?: number
  }
  isRead: boolean
  readAt: string | null
  priority: string
  createdAt: string
  updatedAt: string
  actor: {
    id: number
    name: string
    email: string
    picture: string | null
  }
}

interface NotificationsResponse {
  success: boolean
  data: {
    notifications: Notification[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasMore: boolean
    }
  }
}

const NotificationButton = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null)
  const previousUnreadCount = useRef<number>(0)

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get<NotificationsResponse>('/notifications')
      
      if (response.data.success && response.data.data.notifications) {
        setNotifications(response.data.data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      
      if (response.data.success) {
        const newCount = response.data.data.unreadCount
        
        // Trigger pulsating effect if there's a new notification
        if (newCount > previousUnreadCount.current && previousUnreadCount.current !== 0) {
          setHasNewNotification(true)
          setTimeout(() => setHasNewNotification(false), 3000)
        }
        
        previousUnreadCount.current = newCount
        setUnreadCount(newCount)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`)
      

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
  
      const deletedNotif = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
    
    setDeleteDialogOpen(false)
    setNotificationToDelete(null)
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read')
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      setUnreadCount(0)
      
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const handleDeleteClick = (notificationId: number) => {
    setNotificationToDelete(notificationId)
    setDeleteDialogOpen(true)
    setOpen(false)
  }

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    // 2 seconds
    const interval = setInterval(() => {
      fetchNotifications()
      fetchUnreadCount()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="relative">
            <Bell 
              className={`hover:text-primary h-7 w-7 cursor-pointer ${
                hasNewNotification ? 'animate-bounce' : ''
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="flex w-xl flex-col space-y-2 border-none p-4 shadow-lg"
        >
          <div className='border-b border-gray-300 pb-4 flex justify-between items-center'>
            <h1 className='text-lg text-secondary font-semibold'>Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className='max-h-96 overflow-y-auto no-scrollbar flex flex-col gap-y-2'>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative group rounded-lg p-3 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredNotification(notification.id)}
                  onMouseLeave={() => setHoveredNotification(null)}
                >
                  <div className="flex items-start gap-3">
                    {notification.actor.picture ? (
                      <Image
                        src={notification.actor.picture}
                        alt={notification.actorName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {notification.actorName.charAt(0)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {hoveredNotification === notification.id && (
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-green-600 cursor-pointer" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(notification.id)
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!notification.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notificationToDelete && deleteNotification(notificationToDelete)}
              className="bg-primary cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default NotificationButton