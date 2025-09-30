"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Search, 
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  X
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

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Emergency Alert",
    message: "Flood warning issued for downtown area",
    time: "5 min ago",
    read: true
  },
  {
    id: "2",
    type: "info",
    title: "Volunteer Request",
    message: "Help needed for community cleanup event",
    time: "1 hour ago",
    read: true
  },
  {
    id: "3",
    type: "success",
    title: "Response Completed",
    message: "Your incident report has been processed",
    time: "2 hours ago",
    read: true
  }
]

export function DashboardHeader() {
  const { data: session } = useSession()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

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
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

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
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          {session && (
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
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