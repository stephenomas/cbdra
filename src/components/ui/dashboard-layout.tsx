"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { DashboardHeader } from "./dashboard-header"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen ">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <DashboardHeader />
          
          {/* Content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="pt-4 lg:pt-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}