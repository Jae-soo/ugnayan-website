'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { saveServiceRequest } from '@/lib/storage'
import type { ServiceRequest as LocalServiceRequest } from '@/lib/types'
import { FileText, Send } from 'lucide-react'

export default function ServiceRequestForm(): React.JSX.Element {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    documentType: '',
    purpose: '',
    additionalInfo: ''
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.documentType || !formData.purpose) {
      toast.error('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const referenceId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}`
      const localReq: LocalServiceRequest = {
        referenceId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        documentType: formData.documentType,
        purpose: formData.purpose,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        additionalInfo: formData.additionalInfo || undefined,
      }
      saveServiceRequest(localReq)

      let apiReferenceId: string | undefined
      try {
        const response = await fetch('/api/service-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'service',
            description: formData.additionalInfo || formData.purpose,
            residentName: formData.fullName,
            residentEmail: formData.email,
            residentPhone: formData.phone,
            residentAddress: formData.address,
            documentType: formData.documentType,
            purpose: formData.purpose,
            additionalInfo: formData.additionalInfo
          }),
        })
        if (response.ok) {
          const data = await response.json()
          apiReferenceId = data.request?._id as string | undefined
        }
      } catch {}

      toast.success('Service request submitted!', {
        description: apiReferenceId
          ? `Reference ID: ${apiReferenceId}`
          : 'Saved locally. You will receive updates.'
      })

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        documentType: '',
        purpose: '',
        additionalInfo: ''
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileText className="h-6 w-6" />
          Document Request Service
        </CardTitle>
        <CardDescription className="text-blue-100">
          Request barangay clearance, certificates, permits, and other documents
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09XX-XXX-XXXX"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address in Barangay Irisan</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Purok 18"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Document Request Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Document Request Details</h3>

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value: string) => handleInputChange('documentType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barangay-clearance">Barangay Clearance</SelectItem>
                  <SelectItem value="certificate-of-residency">Certificate of Residency</SelectItem>
                  <SelectItem value="certificate-of-indigency">Certificate of Indigency</SelectItem>
                  <SelectItem value="business-permit">Business Permit</SelectItem>
                  <SelectItem value="certificate-of-good-moral">Certificate of Good Moral Character</SelectItem>
                  <SelectItem value="barangay-id">Barangay ID</SelectItem>
                  <SelectItem value="other">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Request *</Label>
              <Input
                id="purpose"
                type="text"
                placeholder="e.g., Employment, School requirement, Business registration"
                value={formData.purpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('purpose', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional details or special requests..."
                value={formData.additionalInfo}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('additionalInfo', e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Processing time: 1-3 business days</li>
              <li>• You will receive a reference ID upon submission</li>
              <li>• Bring valid ID when claiming the document</li>
              <li>• Some documents may require additional fees</li>
              <li>• Updates will be sent via email and SMS</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Document Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
