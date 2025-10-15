'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthIllustration } from '@/components/ui/auth-illustration'
import OTPVerification from '@/components/auth/OTPVerification'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    state: '',
    country: '',
    governmentId: '',
    ngoName: '',
    ngoFounder: '',
    availableResources: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    emergencyContactRelationship: '',
    distanceWillingToTravel: '',
    medications: '',
    allergies: '',
    conditions: '',
    medicalAdditionalInfo: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special character')
      setLoading(false)
      return
    }

    // Role selection required
    if (!formData.role) {
      setError('Please select a role')
      setLoading(false)
      return
    }

    // Role-specific required fields
    if (formData.role !== 'COMMUNITY_USER' && !formData.availableResources) {
      setError('Available Resources is required for non-community roles')
      setLoading(false)
      return
    }

    if (formData.role === 'GOVERNMENT_AGENCY' && !formData.governmentId) {
      setError('Government ID is required for Government Agency')
      setLoading(false)
      return
    }

    if (formData.role === 'NGO' && (!formData.ngoName || !formData.ngoFounder)) {
      setError('NGO Name and NGO Founder are required for NGO')
      setLoading(false)
      return
    }

    if (formData.role === 'COMMUNITY_USER' && !formData.allergies) {
      setError('Allergies is required for Community Users')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
          state: formData.state,
          country: formData.country,
          governmentId: formData.governmentId || undefined,
          ngoName: formData.ngoName || undefined,
          ngoFounder: formData.ngoFounder || undefined,
          availableResources: formData.availableResources,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactAddress: formData.emergencyContactAddress,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          distanceWillingToTravel: formData.distanceWillingToTravel ? Number(formData.distanceWillingToTravel) : null,
          medications: formData.medications || undefined,
          allergies: formData.allergies || undefined,
          conditions: formData.conditions || undefined,
          medicalAdditionalInfo: formData.medicalAdditionalInfo || undefined,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requiresVerification) {
          setUserEmail(data.email)
          setShowOTPVerification(true)
        } else {
          router.push('/auth/signin?message=Account created successfully. Please sign in.')
        }
      } else {
        setError(data.error || 'Account creation failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleBackToSignup = () => {
    setShowOTPVerification(false)
    setUserEmail('')
  }

  // Show OTP verification screen if needed
  if (showOTPVerification) {
    return <OTPVerification email={userEmail} onBack={handleBackToSignup} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-start items-center p-12 pt-16 text-white">
          <div className="mb-8">
            <AuthIllustration />
          </div>
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Join Our Community
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Be part of a network that makes a difference. Help build resilient communities and respond to disasters together.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center lg:text-left mb-8 lg:pl-6">
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Community Disaster Response Alliance
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join our community and help make a difference
            </p>
          </div>

          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info - two columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email address <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-700 font-medium">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-gray-700 font-medium">
                    State/Province <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your state or province"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country" className="text-gray-700 font-medium">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>

              {/* Distance willing to travel - part of user info */}
              {(!formData.role || formData.role !== 'COMMUNITY_USER') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="distanceWillingToTravel" className="text-gray-700 font-medium">
                      Distance Willing to Travel (miles)
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="distanceWillingToTravel"
                        name="distanceWillingToTravel"
                        type="number"
                        min="0"
                        value={formData.distanceWillingToTravel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter distance in kilometers"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="role" className="text-gray-700 font-medium">
                  Role <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMUNITY_USER">Community User</SelectItem>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                      <SelectItem value="NGO">NGO Representative</SelectItem>
                      <SelectItem value="GOVERNMENT_AGENCY">Government Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Government Agency: Government ID */}
              {formData.role === 'GOVERNMENT_AGENCY' && (
                <div>
                  <Label htmlFor="governmentId" className="text-gray-700 font-medium">
                    Government ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="governmentId"
                      name="governmentId"
                      type="text"
                      required
                      value={formData.governmentId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your government ID"
                    />
                  </div>
                </div>
              )}

              {/* NGO: NGO Name and Founder */}
              {formData.role === 'NGO' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ngoName" className="text-gray-700 font-medium">
                      NGO Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="ngoName"
                        name="ngoName"
                        type="text"
                        required
                        value={formData.ngoName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter NGO name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ngoFounder" className="text-gray-700 font-medium">
                      NGO Founder <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="ngoFounder"
                        name="ngoFounder"
                        type="text"
                        required
                        value={formData.ngoFounder}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter NGO founder's name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.role && formData.role !== 'COMMUNITY_USER' && (
                <div>
                  <Label htmlFor="availableResources" className="text-gray-700 font-medium">
                    Available Resources <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    <Textarea
                      id="availableResources"
                      name="availableResources"
                      required
                      value={formData.availableResources}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="List resources you can provide (e.g., shelter, food, medical aid)"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Community User: Medical ID Section */}
              {formData.role === 'COMMUNITY_USER' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Medical ID</h3>
                  <p className="text-gray-600 mb-4 text-sm">Provide medical details to assist responders. Only allergies is required.</p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="allergies" className="text-gray-700 font-medium">
                        Allergies <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        <Textarea
                          id="allergies"
                          name="allergies"
                          required
                          value={formData.allergies}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="List allergies (e.g., penicillin, peanuts)"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medications" className="text-gray-700 font-medium">
                        Medications
                      </Label>
                      <div className="mt-2">
                        <Textarea
                          id="medications"
                          name="medications"
                          value={formData.medications}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="List current medications"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="conditions" className="text-gray-700 font-medium">
                        Conditions
                      </Label>
                      <div className="mt-2">
                        <Textarea
                          id="conditions"
                          name="conditions"
                          value={formData.conditions}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="List medical conditions"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medicalAdditionalInfo" className="text-gray-700 font-medium">
                        Additional Information
                      </Label>
                      <div className="mt-2">
                        <Textarea
                          id="medicalAdditionalInfo"
                          name="medicalAdditionalInfo"
                          value={formData.medicalAdditionalInfo}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Any other relevant medical information"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact - two columns */}
              {formData.role !== 'GOVERNMENT_AGENCY' && formData.role !== 'NGO' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName" className="text-gray-700 font-medium">
                      Contact Name
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter contact full name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone" className="text-gray-700 font-medium">
                      Contact Phone Number
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter contact phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactAddress" className="text-gray-700 font-medium">
                      Contact Address
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="emergencyContactAddress"
                        name="emergencyContactAddress"
                        type="text"
                        value={formData.emergencyContactAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter contact address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-gray-700 font-medium">
                      Relationship to You
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="emergencyContactRelationship"
                        name="emergencyContactRelationship"
                        type="text"
                        value={formData.emergencyContactRelationship}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Parent, Sibling, Friend"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}


              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <p className={`${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'} flex items-center`}>
                    <span className={`mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                    At least 8 characters
                  </p>
                  <p className={`${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'} flex items-center`}>
                    <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                    Contains special character
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link 
                  href="/auth/signin" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>

          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
              Privacy Policy
            </Link>
              </div>
      </div>
    </div>
    </div>
  )
}