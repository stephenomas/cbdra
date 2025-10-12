"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Users, 
  Shield, 
  Globe, 
  Plus, 
  Home,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "VOLUNTEER":
        return <Shield className="h-4 w-4 text-green-600" />
      case "NGO":
        return <Globe className="h-4 w-4 text-purple-600" />
      case "GOVERNMENT":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Users className="h-4 w-4 text-blue-600" />
    }
  }

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        name: "View Incidents",
        href: "/incidents",
        icon: AlertTriangle,
      },
      // {
      //   name: "Volunteer",
      //   href: "/dashboard/volunteer",
      //   icon: Shield,
      // },
    ]

    // Add "Report Incident" only for community users
    if (session?.user.role === "COMMUNITY_USER") {
      baseItems.splice(1, 0, {
        name: "Report Incident",
        href: "/incidents/report",
        icon: Plus,
      })
    }

    // Add "Resources" only for admin users
    if (session?.user.role === "ADMIN") {
      baseItems.push({
        name: "Resources",
        href: "/dashboard/resources",
        icon: Globe,
      })
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-red-600">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-white mr-2" />
              <h1 className="text-lg font-bold text-white">CBDRA</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          {session && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
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
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(session.user.role)}
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.role.replace("_", " ").split(" ").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(" ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-red-100 text-red-700 border-r-2 border-red-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}