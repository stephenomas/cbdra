"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { ResourceAllocationModal } from "@/components/ui/resource-allocation-modal"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
} from "@/components/ui/table"
import { 
  AlertTriangle, 
  Plus, 
  MapPin, 
  Clock, 
  Eye,
  Loader2,
  Filter,
  Search,
  Users,
  MessageSquare,
  CheckCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IncidentReport {
  id: string
  title: string
  description: string
  type: string
  severity: number
  status: string
  address: string
  latitude?: number
  longitude?: number
  contactInfo?: string
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    name: string
    email: string
    role: string
  }
  responses: Array<{
    id: string
    message: string
    createdAt: string
    responder: {
      id: string
      name: string
      role: string
      organization?: string
    }
  }>
  resourceAllocations: Array<{
    id: string
    resourceType: string
    description?: string
    priority: number
    status: string
    createdAt: string
    allocatedTo: {
      id: string
      name: string
      role: string
      organization?: string
    }
    allocatedBy: {
      id: string
      name: string
      role: string
    }
  }>
}

const incidentTypeLabels: Record<string, string> = {
  FIRE: "Fire",
  FLOOD: "Flood",
  EARTHQUAKE: "Earthquake",
  STORM: "Storm",
  LANDSLIDE: "Landslide",
  DROUGHT: "Drought",
  EPIDEMIC: "Epidemic",
  OTHER: "Other"
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending Review",
  VERIFIED: "Verified",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
}

const severityLabels: Record<number, string> = {
  1: "Low",
  2: "Medium", 
  3: "High",
  4: "Critical",
  5: "Emergency"
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800"
    case "VERIFIED": return "bg-blue-100 text-blue-800"
    case "IN_PROGRESS": return "bg-orange-100 text-orange-800"
    case "RESOLVED": return "bg-green-100 text-green-800"
    case "CLOSED": return "bg-gray-100 text-gray-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 1: return "bg-green-100 text-green-800"
    case 2: return "bg-yellow-100 text-yellow-800"
    case 3: return "bg-orange-100 text-orange-800"
    case 4: return "bg-red-100 text-red-800"
    case 5: return "bg-purple-100 text-purple-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function IncidentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal state for resource allocation
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/incidents")
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch incidents")
      }

      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (error) {
      console.error("Error fetching incidents:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch incidents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  // Filter incidents based on user role
  const roleFilteredIncidents = session.user.role === "COMMUNITY_USER" 
    ? incidents.filter(incident => incident.reporter.id === session.user.id)
    : incidents

  const filteredIncidents = roleFilteredIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter
    const matchesType = typeFilter === "all" || incident.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isAdmin = session.user.role === "ADMIN"
  const isCommunityUser = session.user.role === "COMMUNITY_USER"

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCommunityUser ? "My Incident Reports" : "Incident Reports"}
            </h1>
            <p className="text-gray-600">
              {isCommunityUser 
                ? "View and track your submitted incident reports"
                : "View and manage all incident reports in the system"
              }
            </p>
          </div>
          {isCommunityUser && (
            <Link href="/incidents/report">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report New Incident
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(incidentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'Incident' : 'Incidents'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                <p className="text-gray-600">
                  {isCommunityUser 
                    ? "You haven't reported any incidents yet."
                    : "No incidents match your current filters."
                  }
                </p>
                {isCommunityUser && (
                  <Link href="/incidents/report" className="mt-4 inline-block">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Report Your First Incident
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Location</TableHead>
                      {!isCommunityUser && <TableHead>Reporter</TableHead>}
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{incident.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {incident.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {incidentTypeLabels[incident.type] || incident.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {statusLabels[incident.status] || incident.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {severityLabels[incident.severity] || incident.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm truncate max-w-xs">{incident.address}</span>
                          </div>
                        </TableCell>
                        {!isCommunityUser && (
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{incident.reporter.name}</div>
                              <div className="text-gray-500">{incident.reporter.email}</div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(incident.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/incidents/${incident.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {isAdmin && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedIncident(incident)
                                  setShowResourceModal(true)
                                }}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                Allocate
                              </Button>
                            )}
                            {isCommunityUser && incident.status === "IN_PROGRESS" && (
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                            )}
                            {isCommunityUser && incident.status === "RESOLVED" && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Feedback
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredIncidents.length}
                  />
                )}
              </>
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