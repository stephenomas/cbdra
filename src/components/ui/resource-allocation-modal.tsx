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
    priority: "MEDIUM"
  })

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      setFormData({
        allocatedToId: "",
        resourceType: "",
        description: "",
        priority: "MEDIUM"
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
          user.role !== "COMMUNITY" && user.role !== "ADMIN"
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
      const response = await fetch(`/api/incidents/${incident.id}/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Resource allocated successfully!")
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to allocate resource")
      }
    } catch (err) {
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
              <Label htmlFor="resourceType" className="text-gray-900 font-medium">Resource Type *</Label>
              <Select
                value={formData.resourceType}
                onValueChange={(value) => setFormData({ ...formData, resourceType: value })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select resource type" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="PERSONNEL" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Personnel</SelectItem>
                  <SelectItem value="EQUIPMENT" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Equipment</SelectItem>
                  <SelectItem value="VEHICLE" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Vehicle</SelectItem>
                  <SelectItem value="MEDICAL" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Medical Supplies</SelectItem>
                  <SelectItem value="FOOD" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Food & Water</SelectItem>
                  <SelectItem value="SHELTER" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Shelter</SelectItem>
                  <SelectItem value="COMMUNICATION" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Communication</SelectItem>
                  <SelectItem value="OTHER" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-gray-900 font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="LOW" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Medium</SelectItem>
                  <SelectItem value="HIGH" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">High</SelectItem>
                  <SelectItem value="CRITICAL" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Critical</SelectItem>
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