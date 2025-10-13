"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@prisma/client"

interface ProfileData {
  name: string
  email: string
  phone?: string
  address?: string
  state?: string
  country?: string
  organization?: string
  availableResources?: string
  image?: string
  role?: UserRole
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactAddress?: string
  emergencyContactRelationship?: string
  distanceWillingToTravel?: number | null
}

export default function SettingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch profile")
        }
        const data = await res.json()
        setProfile(data)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load profile"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleImageUpload = async (file: File) => {
    setError("")
    try {
      const form = new FormData()
      form.append("files", file)
      form.append("folder", "avatars")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      const url = data.files?.[0]
      if (!url) throw new Error("No file URL returned")
      setProfile((prev) => prev ? { ...prev, image: url } : prev)
      setSuccess("Profile image uploaded")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to upload image"
      setError(message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }
      setSuccess("Profile updated successfully")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update profile"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information and profile picture.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading profile...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : profile ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile picture */}
                <div>
                  <Label className="mb-2 block">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    {profile.image ? (
                      <Image
                        src={profile.image}
                        alt={profile.name || "Profile"}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 border" />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP. Max 10MB.</p>
                    </div>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profile.name || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, name: e.target.value }) : p)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || ""}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Contact & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, phone: e.target.value }) : p)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profile.address || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, address: e.target.value }) : p)}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                {/* State & Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={profile.state || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, state: e.target.value }) : p)}
                      placeholder="State or province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.country || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, country: e.target.value }) : p)}
                      placeholder="Country"
                    />
                  </div>
                </div>

                {/* Organization & Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={profile.organization || ""}
                      onChange={(e) => setProfile(p => p ? ({ ...p, organization: e.target.value }) : p)}
                      placeholder="Organization (optional)"
                    />
                  </div>
                  {(profile.role === "VOLUNTEER" || profile.role === "NGO" || profile.role === "GOVERNMENT_AGENCY") && (
                    <div>
                      <Label htmlFor="resources">Available Resources</Label>
                      <Textarea
                        id="resources"
                        value={profile.availableResources || ""}
                        onChange={(e) => setProfile(p => p ? ({ ...p, availableResources: e.target.value }) : p)}
                        placeholder="Describe resources you can provide"
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>

                {/* Distance willing to travel */}
                <div>
                  <Label htmlFor="distanceWillingToTravel">Distance Willing to Travel (miles)</Label>
                  <Input
                    id="distanceWillingToTravel"
                    type="number"
                    min={0}
                    value={profile.distanceWillingToTravel ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      const num = val === "" ? null : Number(val)
                      setProfile(p => p ? ({ ...p, distanceWillingToTravel: Number.isNaN(num) ? null : num }) : p)
                    }}
                    placeholder="Enter distance in kilometers"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <Label className="mb-2 block">Emergency Contact</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={profile.emergencyContactName || ""}
                        onChange={(e) => setProfile(p => p ? ({ ...p, emergencyContactName: e.target.value }) : p)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={profile.emergencyContactPhone || ""}
                        onChange={(e) => setProfile(p => p ? ({ ...p, emergencyContactPhone: e.target.value }) : p)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactAddress">Contact Address</Label>
                      <Input
                        id="emergencyContactAddress"
                        value={profile.emergencyContactAddress || ""}
                        onChange={(e) => setProfile(p => p ? ({ ...p, emergencyContactAddress: e.target.value }) : p)}
                        placeholder="Address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={profile.emergencyContactRelationship || ""}
                        onChange={(e) => setProfile(p => p ? ({ ...p, emergencyContactRelationship: e.target.value }) : p)}
                        placeholder="e.g., Parent, Sibling, Friend"
                      />
                    </div>
                  </div>
                </div>

                {success && (
                  <p className="text-sm text-green-600">{success}</p>
                )}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-500">No profile data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}