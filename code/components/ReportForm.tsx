'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { saveReport, setSyncMapEntry } from '@/lib/storage'
import type { Report as LocalReport } from '@/lib/types'
import { AlertTriangle, Send } from 'lucide-react'

export default function ReportForm(): React.JSX.Element {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    reportType: '',
    priority: 'medium',
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.fullName || !formData.email || !formData.reportType || !formData.description) {
      toast.error('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const referenceId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}`
      const normalizeType = (t: string): LocalReport['reportType'] => {
        switch (t) {
          case 'emergency':
          case 'landslide':
          case 'flooding':
          case 'streetlight':
            return t as LocalReport['reportType']
          case 'road':
            return 'road-issue'
          default:
            return 'other'
        }
      }
      const localReport: LocalReport = {
        referenceId,
        reportType: normalizeType(formData.reportType),
        priority: formData.priority as LocalReport['priority'],
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        description: formData.description,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }
      saveReport(localReport)
      try { window.dispatchEvent(new Event('barangay_reports_updated')) } catch {}

      let apiReferenceId: string | undefined
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.reportType,
            category: formData.reportType,
            description: formData.description,
            location: formData.location,
            reporterName: formData.fullName,
            reporterEmail: formData.email,
            reporterPhone: formData.phone,
            priority: formData.priority
          }),
        })
        if (response.ok) {
          const data = await response.json()
          apiReferenceId = data.report?._id as string | undefined
          if (apiReferenceId) {
            try { setSyncMapEntry(referenceId, 'report', apiReferenceId) } catch {}
          }
        }
      } catch {}

      const message = formData.priority === 'high' ? 'URGENT REPORT SUBMITTED!' : 'Report submitted successfully!'
      toast[formData.priority === 'high' ? 'error' : 'success'](message, {
        description: apiReferenceId
          ? `Reference ID: ${apiReferenceId}`
          : 'Saved locally. Officials will review your report.'
      })

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        reportType: '',
        priority: 'medium',
        description: ''
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="h-6 w-6" />
          Report Issues & Emergencies
        </CardTitle>
        <CardDescription className="text-orange-100">
          File complaints, report emergencies, hazards, or community concerns
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Reporter Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporterName">Full Name *</Label>
                <Input
                  id="reporterName"
                  type="text"
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Email Address *</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterPhone">Phone Number (Optional)</Label>
              <Input
                id="reporterPhone"
                type="tel"
                placeholder="09XX-XXX-XXXX"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Report Details</h3>

            <div className="space-y-2">
              <Label htmlFor="reportType">Type of Issue *</Label>
              <Select 
                value={formData.reportType} 
                onValueChange={(value: string) => handleInputChange('reportType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">🚨 Emergency (Fire, Accident, Medical)</SelectItem>
                  <SelectItem value="landslide">⛰️ Landslide / Soil Erosion</SelectItem>
                  <SelectItem value="flooding">🌊 Flooding / Drainage Problem</SelectItem>
                  <SelectItem value="streetlight">💡 Streetlight Request / Repair</SelectItem>
                  <SelectItem value="road">🛣️ Road / Infrastructure Issue</SelectItem>
                  <SelectItem value="noise">📢 Noise Disturbance</SelectItem>
                  <SelectItem value="garbage">🗑️ Garbage / Waste Management</SelectItem>
                  <SelectItem value="security">🔒 Security / Safety Concern</SelectItem>
                  <SelectItem value="dispute">⚖️ Neighbor Dispute</SelectItem>
                  <SelectItem value="transportation">🚌 Transportation Issue</SelectItem>
                  <SelectItem value="other">📝 Other Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Address *</Label>
              <Input
                id="location"
                type="text"
                placeholder="Specific location in Barangay Irisan (e.g., Purok 18, near school)"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: string) => handleInputChange('priority', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low - Minor issue, no immediate danger</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Needs attention soon</SelectItem>
                  <SelectItem value="high">🔴 High - Urgent, requires immediate action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue: What happened? When? Any witnesses? Additional context..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                disabled={isSubmitting}
                rows={6}
                required
              />
            </div>
          </div>

          {/* Safety Notice */}
          <div className={`p-4 rounded-lg border ${
            formData.priority === 'high' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              formData.priority === 'high' ? 'text-red-900' : 'text-yellow-900'
            }`}>
              ⚠️ Important Safety Reminders:
            </h4>
            <ul className={`text-sm space-y-1 ${
              formData.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              <li>• For life-threatening emergencies, call 911 immediately</li>
              <li>• For fire emergencies, contact BFP: (074) 442-6019</li>
              <li>• High-priority reports are sent to barangay officials immediately</li>
              <li>• You will receive updates via email and SMS</li>
              <li>• Anonymous reports are accepted but contact info helps response</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className={`w-full text-lg py-6 ${
              formData.priority === 'high'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
