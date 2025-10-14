"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Shield, User, AlertTriangle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  availableResources?: string | null
}

interface IncidentReport {
  id: string
  title: string
  description: string
  type: string
  severity: number
  status: string
  address: string
}

interface ResourceAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  incident: IncidentReport | null
  onSuccess: () => void
}

export function ResourceAllocationModal({ 
  isOpen, 
  onClose, 
  incident, 
  onSuccess 
}: ResourceAllocationModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    allocatedToId: "",
    resourceType: "",
    description: "",
    priority: 3 // Default to medium priority (1-5 scale)
  })

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      setFormData({
        allocatedToId: "",
        resourceType: "",
        description: "",
        priority: 3 // Default to medium priority (1-5 scale)
      })
      setError("")
      setSuccess("")
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        // Filter out community users for resource allocation
        const eligibleUsers = data.filter((user: User) => 
          user.role !== "COMMUNITY_USER" && user.role !== "ADMIN"
        )
        setUsers(eligibleUsers)
      } else {
        setError("Failed to fetch users")
      }
    } catch (err) {
      setError("Error loading users")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!incident) return
    
    if (!formData.allocatedToId || !formData.resourceType || !formData.description) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Submitting allocation request:", {
        incidentId: incident.id,
        formData: formData
      })

      const response = await fetch(`/api/incidents/${incident.id}/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (response.ok) {
        const successData = await response.json()
        console.log("Success response:", successData)
        setSuccess("Resource allocated successfully!")
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        console.error("Full response:", response)
        setError(errorData.error || "Failed to allocate resource")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Error allocating resource")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !incident) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200">
        <CardHeader className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-gray-900">
                <Shield className="h-5 w-5 mr-2 text-gray-700" />
                Allocate Resources
              </CardTitle>
              <CardDescription className="text-gray-600">
                Assign resources to incident: {incident.title}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="bg-white">
          {/* Incident Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-900">Incident Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-700">
                <span className="font-medium text-gray-900">Type:</span> {incident.type}
              </div>
              <div className="text-gray-700">
                <span className="font-medium text-gray-900">Severity:</span> {incident.severity}
              </div>
              <div className="text-gray-700">
                <span className="font-medium text-gray-900">Status:</span> {incident.status}
              </div>
              <div className="text-gray-700">
                <span className="font-medium text-gray-900">Location:</span> {incident.address}
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="allocatedToId" className="text-gray-900 font-medium">Assign To *</Label>
              <Select
                value={formData.allocatedToId}
                onValueChange={(value) => setFormData({ ...formData, allocatedToId: value })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select a user to assign resources" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-600" />
                        {user.name} ({user.role}) - {user.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resourceType" className="text-gray-900 font-medium">Resources Needed *</Label>
              <Textarea
                id="resourceType"
                placeholder="Describe resources needed (free text)"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                rows={3}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {formData.allocatedToId && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-900">Selected User’s Available Resources</h4>
                {(() => {
                  const selected = users.find(u => u.id === formData.allocatedToId)
                  if (!selected) return (
                    <p className="text-sm text-gray-500">No user selected.</p>
                  )
                  const resources = selected.availableResources?.trim()
                  return resources ? (
                    <p className="text-sm text-gray-700 whitespace-pre-line">{resources}</p>
                  ) : (
                    <p className="text-sm text-gray-500">No available resources provided by this user.</p>
                  )
                })()}
              </div>
            )}

            <div>
              <Label htmlFor="priority" className="text-gray-900 font-medium">Priority</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="1" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Low (1)</SelectItem>
                  <SelectItem value="2" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Low-Medium (2)</SelectItem>
                  <SelectItem value="3" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Medium (3)</SelectItem>
                  <SelectItem value="4" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">High (4)</SelectItem>
                  <SelectItem value="5" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Critical (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-900 font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the resource allocation details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">
                {loading ? "Allocating..." : "Allocate Resource"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}