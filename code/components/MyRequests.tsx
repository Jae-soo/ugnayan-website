'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, AlertTriangle, MessageSquare, Calendar } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface ServiceRequest {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  documentType: string
  purpose: string
  additionalInfo: string
  status: string
  submittedAt: string
}

interface Report {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
  reportType: string
  priority: string
  description: string
  status: string
  submittedAt: string
}

interface Feedback {
  id: string
  name: string
  email: string
  category: string
  rating: number
  message: string
  submittedAt: string
}

export default function MyRequests(): React.JSX.Element {
  const [searchEmail, setSearchEmail] = useState<string>('')
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [hasSearched, setHasSearched] = useState<boolean>(false)

  const handleSearch = (): void => {
    if (!searchEmail) {
      return
    }

    // Load from localStorage
    const storedServiceRequests = localStorage.getItem('serviceRequests')
    const storedReports = localStorage.getItem('reports')
    const storedFeedbacks = localStorage.getItem('feedback')

    // Filter by email
    if (storedServiceRequests) {
      const allRequests = JSON.parse(storedServiceRequests) as ServiceRequest[]
      setServiceRequests(allRequests.filter((req: ServiceRequest) => req.email === searchEmail))
    }

    if (storedReports) {
      const allReports = JSON.parse(storedReports) as Report[]
      setReports(allReports.filter((rep: Report) => rep.email === searchEmail))
    }

    if (storedFeedbacks) {
      const allFeedbacks = JSON.parse(storedFeedbacks) as Feedback[]
      setFeedbacks(allFeedbacks.filter((fb: Feedback) => fb.email === searchEmail))
    }

    setHasSearched(true)
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'approved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Search className="h-6 w-6" />
            Track My Submissions
          </CardTitle>
          <CardDescription className="text-indigo-100">
            View all your service requests, reports, and feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchEmail">Enter Your Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="searchEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={searchEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchEmail(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
                <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {hasSearched && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-800">
                  <strong>Search Results for:</strong> {searchEmail}
                </p>
                <p className="text-sm text-indigo-600 mt-1">
                  Found {serviceRequests.length} service requests, {reports.length} reports, 
                  and {feedbacks.length} feedback submissions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Requests */}
      {hasSearched && serviceRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Document Service Requests ({serviceRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceRequests.map((request: ServiceRequest) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.documentType}</CardTitle>
                        <p className="text-sm text-gray-600">Reference: {request.id}</p>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid md:grid-cols-2 gap-2">
                        <p><strong>Name:</strong> {request.fullName}</p>
                        <p><strong>Phone:</strong> {request.phone}</p>
                      </div>
                      <p><strong>Purpose:</strong> {request.purpose}</p>
                      {request.additionalInfo && (
                        <p><strong>Additional Info:</strong> {request.additionalInfo}</p>
                      )}
                      <Separator className="my-2" />
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(request.submittedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports */}
      {hasSearched && reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Issue Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report: Report) => (
                <Card key={report.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.reportType}</CardTitle>
                        <p className="text-sm text-gray-600">Reference: {report.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={report.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {report.priority}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid md:grid-cols-2 gap-2">
                        <p><strong>Reporter:</strong> {report.fullName}</p>
                        <p><strong>Location:</strong> {report.location}</p>
                      </div>
                      <p><strong>Description:</strong> {report.description}</p>
                      <Separator className="my-2" />
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(report.submittedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {hasSearched && feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Feedback Submissions ({feedbacks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbacks.map((feedback: Feedback) => (
                <Card key={feedback.id} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg capitalize">{feedback.category.replace('-', ' ')}</CardTitle>
                        <p className="text-sm text-gray-600">Reference: {feedback.id}</p>
                      </div>
                      <div className="text-yellow-500 font-bold">
                        ⭐ {feedback.rating}/5
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {feedback.name}</p>
                      <p><strong>Message:</strong> {feedback.message}</p>
                      <Separator className="my-2" />
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(feedback.submittedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {hasSearched && serviceRequests.length === 0 && reports.length === 0 && feedbacks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Found</h3>
            <p className="text-gray-600">
              No service requests, reports, or feedback found for <strong>{searchEmail}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please check your email address or submit a new request
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
