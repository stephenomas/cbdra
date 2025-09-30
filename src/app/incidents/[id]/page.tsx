"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { 
  AlertTriangle, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User,
  Phone,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react"

interface IncidentReport {
  id: string
  title: string
  description: string
  type: string
  severity: number
  status: string
  location: string
  latitude?: number
  longitude?: number
  contactInfo?: string
  createdAt: string
  updatedAt: string
  verifiedAt?: string
  verifiedBy?: string
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
  MEDICAL_EMERGENCY: "Medical Emergency",
  ACCIDENT: "Accident",
  SECURITY_THREAT: "Security Threat",
  INFRASTRUCTURE_DAMAGE: "Infrastructure Damage",
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
    case "PENDING": return "text-yellow-600 bg-yellow-100"
    case "VERIFIED": return "text-blue-600 bg-blue-100"
    case "IN_PROGRESS": return "text-orange-600 bg-orange-100"
    case "RESOLVED": return "text-green-600 bg-green-100"
    case "CLOSED": return "text-gray-600 bg-gray-100"
    default: return "text-gray-600 bg-gray-100"
  }
}

const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 1: return "text-green-600 bg-green-100"
    case 2: return "text-blue-600 bg-blue-100"
    case 3: return "text-yellow-600 bg-yellow-100"
    case 4: return "text-orange-600 bg-orange-100"
    case 5: return "text-red-600 bg-red-100"
    default: return "text-gray-600 bg-gray-100"
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "VOLUNTEER": return "🤝"
    case "NGO": return "🏢"
    case "GOVERNMENT_AGENCY": return "🏛️"
    case "ADMIN": return "👑"
    default: return "👤"
  }
}

export default function IncidentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [incident, setIncident] = useState<IncidentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchIncident(params.id as string)
    }
  }, [params.id])

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

  const fetchIncident = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/incidents/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch incident")
      }

      const data = await response.json()
      setIncident(data)
    } catch (error) {
      console.error("Error fetching incident:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch incident")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/incidents">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Incidents
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Incident not found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/incidents">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Incidents
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/incidents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Incidents
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incident Details</h1>
            <p className="text-gray-600">View detailed information about this incident report</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3">{incident.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
                        {statusLabels[incident.status]}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                        {severityLabels[incident.severity]} Priority
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        {incidentTypeLabels[incident.type]}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{incident.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(incident.createdAt).toLocaleDateString()} at{" "}
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {incident.contactInfo && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{incident.contactInfo}</span>
                      </div>
                    )}
                    {incident.verifiedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Verified on {new Date(incident.verifiedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  {incident.latitude && incident.longitude && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Coordinates</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Latitude: {incident.latitude}</div>
                        <div>Longitude: {incident.longitude}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resource Allocations */}
            {incident.resourceAllocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Allocated Resources</CardTitle>
                  <CardDescription>
                    Resources assigned to respond to this incident
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incident.resourceAllocations.map((allocation) => (
                      <div key={allocation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {allocation.resourceType}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Assigned to: {getRoleIcon(allocation.allocatedTo.role)} {allocation.allocatedTo.name}
                              {allocation.allocatedTo.organization && (
                                <span className="ml-1">({allocation.allocatedTo.organization})</span>
                              )}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            allocation.status === "ASSIGNED" ? "bg-blue-100 text-blue-800" :
                            allocation.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-800" :
                            allocation.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {allocation.status.replace("_", " ")}
                          </span>
                        </div>
                        {allocation.description && (
                          <p className="text-sm text-gray-700 mb-2">{allocation.description}</p>
                        )}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Priority: {allocation.priority}/5</span>
                          <span>
                            Allocated on {new Date(allocation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responses */}
            {incident.responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses</CardTitle>
                  <CardDescription>
                    Updates and responses from emergency responders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incident.responses.map((response) => (
                      <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {getRoleIcon(response.responder.role)} {response.responder.name}
                          </span>
                          {response.responder.organization && (
                            <span className="text-sm text-gray-600">
                              ({response.responder.organization})
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleDateString()} at{" "}
                            {new Date(response.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Reporter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Name:</span>
                    <p className="text-gray-700">{incident.reporter.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Role:</span>
                    <p className="text-gray-700">
                      {incident.reporter.role.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                  {session.user.role === "ADMIN" && (
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email:</span>
                      <p className="text-gray-700">{incident.reporter.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Incident Reported</p>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString()} at{" "}
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {incident.verifiedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Incident Verified</p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.verifiedAt).toLocaleDateString()} at{" "}
                          {new Date(incident.verifiedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {incident.resourceAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Resource Allocated</p>
                        <p className="text-xs text-gray-500">
                          {allocation.resourceType} to {allocation.allocatedTo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(allocation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {incident.updatedAt !== incident.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {new Date(incident.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(incident.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}