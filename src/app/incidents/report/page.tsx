"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, AlertTriangle, Upload, X, Image as ImageIcon, Video } from "lucide-react"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { GoogleMap } from "@/components/ui/google-map"

const incidentTypes = [
  { value: "FIRE", label: "Fire" },
  { value: "FLOOD", label: "Flood" },
  { value: "EARTHQUAKE", label: "Earthquake" },
  { value: "STORM", label: "Storm" },
  { value: "LANDSLIDE", label: "Landslide" },
  { value: "DROUGHT", label: "Drought" },
  { value: "EPIDEMIC", label: "Epidemic" },
  { value: "OTHER", label: "Other" }
]

const severityLevels = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
  { value: 5, label: "Emergency" }
]

export default function ReportIncidentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    severity: "",
    address: "",
    latitude: "",
    longitude: "",
    contactInfo: ""
  })

  const [showMap, setShowMap] = useState(false)

  // Redirect if not authenticated or not a community user
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

  if (session.user.role !== "COMMUNITY_USER") {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only community users can submit incident reports.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get current location. Please enter location manually.")
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload files")
      }

      const result = await response.json()
      setUploadedFiles(prev => [...prev, ...result.files])
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload files")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (fileUrl: string) => {
    setUploadedFiles(prev => prev.filter(url => url !== fileUrl))
  }

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image'
    }
    if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
      return 'video'
    }
    return 'unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate required fields
    if (!formData.title || !formData.description || !formData.type || !formData.severity || !formData.address) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          severity: parseInt(formData.severity),
          address: formData.address,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          contactInfo: formData.contactInfo || null,
          images: uploadedFiles
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit incident report")
      }

      setSuccess(true)
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "",
        severity: "",
        address: "",
        latitude: "",
        longitude: "",
        contactInfo: ""
      })
      setUploadedFiles([])

      // Redirect to incidents dashboard after 2 seconds
      setTimeout(() => {
        router.push("/incidents")
      }, 2000)

    } catch (error) {
      console.error("Error submitting incident:", error)
      setError(error instanceof Error ? error.message : "Failed to submit incident report")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Report Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your incident report has been submitted and is being reviewed by our team.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your incidents dashboard...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              Report New Incident
            </h1>
            <p className="text-gray-600">
              Submit a detailed report about an incident in your community. All fields marked with * are required.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Brief description of the incident"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Incident Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder="Provide detailed information about the incident, including what happened, when it occurred, and any immediate actions taken..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="location"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address or landmark"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="shrink-0"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="shrink-0"
                >
                  {showMap ? "Hide Map" : "Show Map"}
                </Button>
              </div>
              {showMap && (
                <div className="mt-4">
                  <GoogleMap
                    onLocationSelect={handleLocationSelect}
                    initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                    initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Click on the map or drag the marker to select a location
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="Auto-filled with GPS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="Auto-filled with GPS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Phone number or additional contact details (optional)"
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="files">Images/Videos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="files"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload images or videos
                  </span>
                  <span className="text-xs text-gray-500">
                    Supports: JPG, PNG, GIF, WebP, MP4, WebM, OGG (Max 10MB each)
                  </span>
                </label>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {uploadedFiles.map((fileUrl, index) => (
                    <div key={index} className="relative group">
                      {getFileType(fileUrl) === 'image' ? (
                        <div className="relative">
                          <Image
                            src={fileUrl}
                            alt={`Upload ${index + 1}`}
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              console.error('Image failed to load:', fileUrl)
                              const target = e.currentTarget
                              target.style.backgroundColor = '#f3f4f6'
                              target.style.display = 'flex'
                              target.style.alignItems = 'center'
                              target.style.justifyContent = 'center'
                              target.innerHTML = '<span style="color: #6b7280; font-size: 12px;">Failed to load image</span>'
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', fileUrl)
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : getFileType(fileUrl) === 'video' ? (
                        <div className="relative">
                          <video
                            src={fileUrl}
                            className="w-full h-24 object-cover rounded-lg border"
                            muted
                            onError={(e) => {
                              console.error('Video failed to load:', fileUrl)
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                          <span className="text-xs text-gray-500">Unknown file</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(fileUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading files...
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                "Submit Incident Report"
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}