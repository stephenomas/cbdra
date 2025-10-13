"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Filter, Search, Shield, Users, XCircle } from "lucide-react"

type UserRole = "COMMUNITY_USER" | "VOLUNTEER" | "NGO" | "GOVERNMENT_AGENCY" | "ADMIN"

interface ListedUser {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization?: string | null
  availableResources?: string | null
  verified?: boolean
  createdAt?: string
}

export default function AdminResourcesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<ListedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
  const [verificationFilter, setVerificationFilter] = useState<"all" | "pending" | "verified">("all")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Type guards to eliminate any casts from Select onValueChange
  const isUserRoleOrAll = (v: string): v is UserRole | "all" => {
    return (
      v === "all" ||
      v === "COMMUNITY_USER" ||
      v === "VOLUNTEER" ||
      v === "NGO" ||
      v === "GOVERNMENT_AGENCY" ||
      v === "ADMIN"
    )
  }

  const isVerificationFilter = (v: string): v is "all" | "pending" | "verified" => {
    return v === "all" || v === "pending" || v === "verified"
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        throw new Error("Failed to load users")
      }
      const data = await res.json()
      setUsers(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading users")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter

      const isVerified = !!u.verified
      const matchesVerification =
        verificationFilter === "all"
          ? true
          : verificationFilter === "verified"
          ? isVerified
          : !isVerified

      return matchesSearch && matchesRole && matchesVerification
    })
  }, [users, searchTerm, roleFilter, verificationFilter])

  const canVetRole = (role: UserRole) => ["VOLUNTEER", "NGO", "GOVERNMENT_AGENCY"].includes(role)

  const handleVet = async (userId: string, decision: "ACCEPT" | "DECLINE") => {
    setActionLoadingId(userId)
    setError("")
    try {
      const res = await fetch(`/api/users/${userId}/vet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update verification")
      }
      await fetchUsers()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed")
    } finally {
      setActionLoadingId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-6 w-6 animate-pulse text-red-600 mr-2" />
          <span className="text-gray-600">Loading resources...</span>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">View and vet users for operational roles.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" />Filters & Search</CardTitle>
            <CardDescription>Find users by role and verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <Select
                  value={roleFilter}
                  onValueChange={(v) => {
                    if (isUserRoleOrAll(v)) setRoleFilter(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="COMMUNITY_USER">Community User</SelectItem>
                    <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    <SelectItem value="NGO">NGO</SelectItem>
                    <SelectItem value="GOVERNMENT_AGENCY">Government Agency</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={verificationFilter}
                  onValueChange={(v) => {
                    if (isVerificationFilter(v)) setVerificationFilter(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSearchTerm(""); setRoleFilter("all"); setVerificationFilter("all") }}>Clear</Button>
                <Button onClick={fetchUsers}>Refresh</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2" />Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Administrators can vet volunteers, NGOs, and agencies</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-60" />
                <p>No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const statusBadge = u.verified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                      </span>
                    )
                    const roleIcon = u.role === "VOLUNTEER" ? (
                      <Shield className="h-4 w-4 text-green-600" />
                    ) : u.role === "NGO" ? (
                      <Users className="h-4 w-4 text-purple-600" />
                    ) : u.role === "GOVERNMENT_AGENCY" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Users className="h-4 w-4 text-blue-600" />
                    )

                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {roleIcon}
                            <div>
                              <div className="font-medium text-gray-900">{u.name || "—"}</div>
                              <div className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{u.email}</TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-gray-700">{u.role.replace("_", " ")}</span>
                        </TableCell>
                        <TableCell className="text-gray-700">{u.organization || "—"}</TableCell>
                        <TableCell>{statusBadge}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/resources/${u.id}`}>
                              <Button size="sm" variant="outline">View</Button>
                            </Link>
                            {canVetRole(u.role) && !u.verified ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVet(u.id, "ACCEPT")}
                                  disabled={actionLoadingId === u.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleVet(u.id, "DECLINE")}
                                  disabled={actionLoadingId === u.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Decline
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}