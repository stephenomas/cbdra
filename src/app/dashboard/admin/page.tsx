"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { ResourceAllocationModal } from "@/components/ui/resource-allocation-modal"
import { 
  AlertTriangle, 
  Users, 
  Shield, 
  Settings, 
  Search, 
  Filter,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface IncidentReport {
  id: string
  title: string
  description: string
  type: string
  severity: number
  status: string
  address: string
  coordinates?: string
  contactName: string
  contactPhone: string
  contactEmail: string
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    name: string
    email: string
  }
  resourceAllocations: Array<{
    id: string
    resourceType: string
    description: string
    priority: string
    status: string
    allocatedTo: {
      name: string
      email: string
    }
    allocatedBy: {
      name: string
      email: string
    }
    createdAt: string
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<IncidentReport[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [showResourceModal, setShowResourceModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchIncidents()
      fetchUsers()
    }
  }, [session])

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      if (response.ok) {
        const data = await response.json()
        setIncidents(data.incidents || [])
      } else {
        setError("Failed to fetch incidents")
      }
    } catch (err) {
      setError("Error loading incidents")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchIncidents() // Refresh the list
      } else {
        setError("Failed to update incident status")
      }
    } catch (err) {
      setError("Error updating incident")
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter
    const matchesType = typeFilter === "all" || incident.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "CLOSED":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5:
        return "text-red-600 bg-red-50"
      case 4:
        return "text-orange-600 bg-orange-50"
      case 3:
        return "text-yellow-600 bg-yellow-50"
      case 2:
        return "text-blue-600 bg-blue-50"
      case 1:
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Manage incidents, allocate resources, and oversee disaster response operations.
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Total Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{incidents.length}</div>
              <p className="text-sm text-gray-600">All time reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {incidents.filter(i => i.status === "REPORTED" || i.status === "IN_PROGRESS").length}
              </div>
              <p className="text-sm text-gray-600">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {incidents.filter(i => 
                  i.status === "RESOLVED" && 
                  new Date(i.updatedAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <p className="text-sm text-gray-600">Completed incidents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              <p className="text-sm text-gray-600">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="REPORTED">Reported</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                  <SelectItem value="FLOOD">Flood</SelectItem>
                  <SelectItem value="EARTHQUAKE">Earthquake</SelectItem>
                  <SelectItem value="STORM">Storm</SelectItem>
                  <SelectItem value="ACCIDENT">Accident</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Reports ({filteredIncidents.length})</CardTitle>
            <CardDescription>
              Manage and respond to incident reports from the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No incidents found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(incident.status)}
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{incident.description}</p>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {incident.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {incident.reporter.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {incident.contactPhone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {incident.resourceAllocations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Resource Allocations ({incident.resourceAllocations.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {incident.resourceAllocations.map((allocation) => (
                                <span key={allocation.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {allocation.resourceType} - {allocation.allocatedTo.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Select
                          value={incident.status}
                          onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REPORTED">Reported</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedIncident(incident)
                            setShowResourceModal(true)
                          }}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Allocate
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/incidents/${incident.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Allocation Modal */}
        <ResourceAllocationModal
          isOpen={showResourceModal}
          onClose={() => {
            setShowResourceModal(false)
            setSelectedIncident(null)
          }}
          incident={selectedIncident}
          onSuccess={() => {
            fetchIncidents() // Refresh incidents to show new allocations
          }}
        />
      </div>
    </DashboardLayout>
  )
}