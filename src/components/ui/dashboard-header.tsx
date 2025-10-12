"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "alert" | "info" | "success"
  title: string
  message: string
  time: string
  read: boolean
}

type ApiNotification = {
  id: string | number
  type?: "alert" | "info" | "success"
  title?: string
  message?: string
  time?: string
  read?: boolean
}

function mapApiNotifications(data: unknown): Notification[] {
  if (!Array.isArray(data)) return []
  return data.map((n): Notification => ({
    id: String((n as ApiNotification).id),
    type: (n as ApiNotification).type ?? "info",
    title: (n as ApiNotification).title ?? "Notification",
    message: (n as ApiNotification).message ?? "",
    time: formatRelativeTime((n as ApiNotification).time ?? new Date().toISOString()),
    read: Boolean((n as ApiNotification).read),
  }))
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
}

export function DashboardHeader() {
  const { data: session } = useSession()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    // Persist on server then refetch
    fetch('/api/notifications/mark-read', { method: 'POST' })
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        // Optional refetch to sync
        fetch('/api/notifications', { cache: 'no-store' })
          .then(res => res.ok ? res.json() : [])
          .then((data) => {
            setNotifications(mapApiNotifications(data))
          })
          .catch(() => {})
      })
  }

  useEffect(() => {
    let alive = true
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const mapped = mapApiNotifications(data)
        if (alive) setNotifications(mapped)
      } catch (err) {
        // silently ignore
        console.error('Failed to fetch notifications', err)
      }
    }
    fetchNotifications()
    return () => { alive = false }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="">
        {/* Left side - Search */}
        

        {/* Right side - Actions */}
        <div className="flex items-center float-right space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer",
                            !notification.read && "bg-blue-50"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => router.push("/dashboard/settings")}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Profile */}
              {session && (
                <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user.role.replace("_", " ").split(" ").map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(" ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}