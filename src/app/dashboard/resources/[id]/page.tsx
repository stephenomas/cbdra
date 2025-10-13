"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, CheckCircle, Mail, Phone, User as UserIcon, Building, MapPin, Users, Shield } from "lucide-react"

type UserRole = "COMMUNITY_USER" | "VOLUNTEER" | "NGO" | "GOVERNMENT_AGENCY" | "ADMIN"

interface UserDetail {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization?: string | null
  verified?: boolean
  createdAt?: string
  availableResources?: string | null
  address?: string | null
  state?: string | null
  country?: string | null
  phone?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactAddress?: string | null
  emergencyContactRelationship?: string | null
  distanceWillingToTravel?: number | null
}

export default function AdminUserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : ""

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [vetLoading, setVetLoading] = useState(false)
  const [vetError, setVetError] = useState("")
  const [vetMessage, setVetMessage] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/users/${id}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to load user")
        }
        setUser(data.user)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error loading user")
      } finally {
        setLoading(false)
      }
    }
    if (session?.user?.role === "ADMIN" && id) {
      load()
    }
  }, [session, id])

  const handleVet = async (decision: "ACCEPT" | "DECLINE") => {
    if (!id) return
    try {
      setVetLoading(true)
      setVetError("")
      setVetMessage("")
      const res = await fetch(`/api/users/${id}/vet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit decision")
      }
      setVetMessage(
        decision === "ACCEPT" ? "User has been approved." : "User has been declined."
      )
      setUser(prev => prev ? { ...prev, verified: decision === "ACCEPT" } : prev)
    } catch (e: unknown) {
      setVetError(e instanceof Error ? e.message : "Error submitting decision")
    } finally {
      setVetLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-6 w-6 animate-pulse text-red-600 mr-2" />
          <span className="text-gray-600">Loading user details...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">View full profile and status.</p>
          </div>
          <Link href="/dashboard/resources">
            <Button variant="outline">Back to Resources</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {vetMessage && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{vetMessage}</AlertDescription>
          </Alert>
        )}
        {vetError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{vetError}</AlertDescription>
          </Alert>
        )}

        {!user ? (
          <div className="text-center py-10 text-gray-500">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p>User not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><UserIcon className="h-5 w-5 mr-2" />Basic Information</CardTitle>
                <CardDescription>Core identity and role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <UserIcon className="h-4 w-4" /> {user.name || "—"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4" /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <ShieldBadge role={user.role} />
                    <span className="text-xs font-medium">{user.role.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Pending Verification
                      </span>
                    )}
                  </div>
                  {(["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"] as UserRole[]).includes(user.role) && (
                    <div className="flex gap-2 mt-2">
                      {!user.verified && (
                        <Button onClick={() => handleVet("ACCEPT")} disabled={vetLoading}>
                          Accept
                        </Button>
                      )}
                      <Button variant="destructive" onClick={() => handleVet("DECLINE")} disabled={vetLoading}>
                        {user.verified ? "Revoke" : "Decline"}
                      </Button>
                    </div>
                  )}
                  {user.organization && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building className="h-4 w-4" /> {user.organization}
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4" /> {user.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MapPin className="h-5 w-5 mr-2" />Location & Reach</CardTitle>
                <CardDescription>Service area and address</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-gray-700">Address: {user.address || "—"}</div>
                  <div className="text-gray-700">State: {user.state || "—"}</div>
                  <div className="text-gray-700">Country: {user.country || "—"}</div>
                  <div className="text-gray-700">Distance willing to travel: {user.distanceWillingToTravel != null ? `${user.distanceWillingToTravel} km` : "—"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Available Resources</CardTitle>
                <CardDescription>Capabilities offered by the user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {user.availableResources || "—"}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Who to reach in emergencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>Name: {user.emergencyContactName || "—"}</div>
                  <div>Phone: {user.emergencyContactPhone || "—"}</div>
                  <div>Address: {user.emergencyContactAddress || "—"}</div>
                  <div>Relationship: {user.emergencyContactRelationship || "—"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function ShieldBadge({ role }: { role: UserRole }) {
  if (role === "VOLUNTEER") return <span className="inline-flex items-center text-green-700"><CheckCircle className="h-4 w-4 mr-1" /> Volunteer</span>
  if (role === "NGO") return <span className="inline-flex items-center text-purple-700"><Users className="h-4 w-4 mr-1" /> NGO</span>
  if (role === "GOVERNMENT_AGENCY") return <span className="inline-flex items-center text-red-700"><AlertTriangle className="h-4 w-4 mr-1" /> Agency</span>
  if (role === "ADMIN") return <span className="inline-flex items-center text-blue-700"><Shield className="h-4 w-4 mr-1" /> Admin</span>
  return <span className="inline-flex items-center text-gray-700"><Users className="h-4 w-4 mr-1" /> Community</span>
}