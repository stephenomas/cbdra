"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, Shield, Globe, Plus } from "lucide-react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening in your community disaster response network.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 text-red-600 mr-2" />
                Report Incident
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Report a new emergency or disaster incident in your area
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                View Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See active incidents and emergency situations nearby
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                Volunteer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Offer help and coordinate response efforts
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Globe className="h-5 w-5 text-purple-600 mr-2" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access emergency resources and contact information
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                Latest emergency reports in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent incidents reported</p>
                <p className="text-sm">This is good news for your community!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Responses</CardTitle>
              <CardDescription>
                Your recent volunteer activities and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent responses</p>
                <p className="text-sm">Ready to help when needed!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}