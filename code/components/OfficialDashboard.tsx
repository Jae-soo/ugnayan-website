'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Bell,
  Plus,
  Search,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  Activity,
  LogOut,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Send,
  History,
  Trash2,
  Paperclip
} from 'lucide-react'
import type { ServiceRequest, Report, Reply } from '@/lib/types'
import { 
  getServiceRequests, 
  updateServiceRequestStatus, 
  getReports, 
  updateReportStatus, 
  saveReply, 
  getRepliesForReference
} from '@/lib/storage'
import { toast } from 'sonner'

interface OfficialDashboardProps {
  officialInfo: {
    name: string
    role: string
    username: string
  }
  onLogout: () => void
}

interface Announcement {
  id: string
  title: string
  content: string
  category: 'general' | 'event' | 'alert' | 'emergency'
  priority: 'low' | 'medium' | 'high'
  postedAt: string
}

interface UserData {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  registeredAt: string
  status: 'active' | 'inactive'
}

export default function OfficialDashboard({ officialInfo, onLogout }: OfficialDashboardProps): React.JSX.Element {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  
  const [reports, setReports] = useState<Report[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState<boolean>(false)
  const [showReplyDialog, setShowReplyDialog] = useState<boolean>(false)
  const [showAllServiceRequestsDialog, setShowAllServiceRequestsDialog] = useState<boolean>(false)
  const [showAllReportsDialog, setShowAllReportsDialog] = useState<boolean>(false)
  const [replyType, setReplyType] = useState<'service-request' | 'report'>('service-request')
  const [replyReferenceId, setReplyReferenceId] = useState<string>('')
  const [replyRecipient, setReplyRecipient] = useState<{ email: string; phone: string; name: string }>({ email: '', phone: '', name: '' })
  const [replyMessage, setReplyMessage] = useState<string>('')
  const [repliesHistory, setRepliesHistory] = useState<Reply[]>([])
  const [showRepliesDialog, setShowRepliesDialog] = useState<boolean>(false)
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false)
  const [replyFiles, setReplyFiles] = useState<Array<{ name: string; size: number; type: string; dataUrl: string }>>([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'event' | 'alert' | 'emergency',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [stats, setStats] = useState({
    totalServiceRequests: 0,
    totalReports: 0,
    pendingServiceRequests: 0,
    urgentReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    activeUsers: 0
  })

  useEffect(() => {
    loadData()
    loadUsers()
    loadAnnouncements()
  }, [])

  const loadData = (): void => {
    const requests = getServiceRequests()
    const allReports = getReports()

    setServiceRequests(requests)
    setReports(allReports)

    setStats({
      totalServiceRequests: requests.length,
      totalReports: allReports.length,
      pendingServiceRequests: requests.filter((r) => r.status === 'pending').length,
      urgentReports: allReports.filter((r) => r.priority === 'high').length,
      resolvedReports: allReports.filter((r) => r.status === 'resolved').length,
      totalUsers: 0,
      activeUsers: 0
    })
  }

  const loadUsers = (): void => {
    const storedUsers = localStorage.getItem('barangay_users')
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers) as UserData[]
      setUsers(parsedUsers)
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: parsedUsers.length,
        activeUsers: parsedUsers.filter((u) => u.status === 'active').length
      }))
    }
  }

  const loadAnnouncements = (): void => {
    const storedAnnouncements = localStorage.getItem('barangay_announcements')
    const deletedIdsRaw = localStorage.getItem('deleted_barangay_announcements')
    const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) as string[] : []
    if (storedAnnouncements) {
      const anns = JSON.parse(storedAnnouncements) as Announcement[]
      const filtered = anns.filter((a) => !deletedIds.includes(a.id))
      setAnnouncements(filtered)
    } else {
      setAnnouncements([])
    }
  }

  const handleUpdateRequestStatus = (referenceId: string, newStatus: string): void => {
    updateServiceRequestStatus(referenceId, newStatus)
    loadData()
    toast.success(`Request ${referenceId} updated to ${newStatus}`)
  }

  

  const handleUpdateReportStatus = (referenceId: string, newStatus: string): void => {
    updateReportStatus(referenceId, newStatus)
    loadData()
    toast.success(`Report ${referenceId} updated to ${newStatus}`)
  }

  const handleDeleteServiceRequest = (referenceId: string): void => {
    const requests = getServiceRequests()
    const updated = requests.filter((r) => r.referenceId !== referenceId)
    localStorage.setItem('barangay_service_requests', JSON.stringify(updated))
    loadData()
    toast.success(`Service request ${referenceId} deleted`)
  }

  const handleDeleteReport = (referenceId: string): void => {
    const allReports = getReports()
    const updated = allReports.filter((r) => r.referenceId !== referenceId)
    localStorage.setItem('barangay_reports', JSON.stringify(updated))
    loadData()
    toast.success(`Report ${referenceId} deleted`)
  }

  

  const handleDeleteAnnouncement = (id: string): void => {
    const updated = announcements.filter((a) => a.id !== id)
    localStorage.setItem('barangay_announcements', JSON.stringify(updated))
    const deletedIdsRaw = localStorage.getItem('deleted_barangay_announcements')
    const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) as string[] : []
    if (!deletedIds.includes(id)) {
      deletedIds.push(id)
      localStorage.setItem('deleted_barangay_announcements', JSON.stringify(deletedIds))
    }
    setAnnouncements(updated)
    toast.success('Announcement deleted permanently')
  }

  const handleCreateAnnouncement = (): void => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Please fill in all fields')
      return
    }

    const announcement: Announcement = {
      id: `ANN-${Date.now()}`,
      ...newAnnouncement,
      postedAt: new Date().toISOString()
    }

    const updated = [...announcements, announcement]
    localStorage.setItem('barangay_announcements', JSON.stringify(updated))
    setAnnouncements(updated)
    
    setNewAnnouncement({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium'
    })
    setShowAnnouncementDialog(false)
    toast.success('Announcement created successfully!')
  }

  const handleOpenReply = (referenceId: string, type: 'service-request' | 'report', recipient: { email: string; phone: string; name: string }): void => {
    setReplyReferenceId(referenceId)
    setReplyType(type)
    setReplyRecipient(recipient)
    setReplyMessage('')
    setReplyFiles([])
    setShowReplyDialog(true)
  }

  const handleSendReply = async (): Promise<void> => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSendingReply(true)

    try {
      const reply: Reply = {
        id: `REPLY-${Date.now()}`,
        referenceId: replyReferenceId,
        type: replyType,
        officialName: officialInfo.name,
        officialRole: officialInfo.role,
        message: replyMessage,
        sentAt: new Date().toISOString(),
        recipientEmail: replyRecipient.email,
        recipientPhone: replyRecipient.phone,
        emailSent: false,
        smsSent: false,
        attachments: replyFiles.length > 0 ? replyFiles : undefined
      }

      saveReply(reply)

      // Send email notification
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyRecipient.email,
          subject: `Re: ${replyType === 'service-request' ? 'Service Request' : 'Report'} ${replyReferenceId}`,
          message: replyMessage,
          referenceId: replyReferenceId,
          type: replyType,
          attachments: replyFiles
        })
      })

      if (emailResponse.ok) {
        reply.emailSent = true
      }

      // Send SMS notification if phone number is provided
      if (replyRecipient.phone) {
        const smsResponse = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: replyRecipient.phone,
            message: replyMessage,
            referenceId: replyReferenceId,
            type: replyType
          })
        })

        if (smsResponse.ok) {
          reply.smsSent = true
        }
      }

      // Show appropriate success message
      if (reply.emailSent && reply.smsSent) {
        toast.success('Reply sent successfully!', {
          description: `Email and SMS notifications sent to ${replyRecipient.name}`
        })
      } else if (reply.emailSent && !reply.smsSent && replyRecipient.phone) {
        toast.success('Reply sent via email', {
          description: 'SMS notification could not be sent, but email was delivered'
        })
      } else if (!reply.emailSent && reply.smsSent) {
        toast.success('Reply sent via SMS', {
          description: 'Email notification failed, but SMS was delivered'
        })
      } else if (reply.emailSent && !replyRecipient.phone) {
        toast.success('Reply sent successfully!', {
          description: `Email notification sent to ${replyRecipient.email}`
        })
      } else {
        toast.warning('Reply saved but notifications failed', {
          description: 'The reply has been recorded but could not be sent via email or SMS'
        })
      }

      setShowReplyDialog(false)
      setReplyMessage('')
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply', {
        description: 'Please try again later'
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleViewReplies = (referenceId: string): void => {
    const replies = getRepliesForReference(referenceId)
    setRepliesHistory(replies)
    setShowRepliesDialog(true)
  }

  const exportData = (type: string): void => {
    let data: unknown[] = []
    let filename = ''

    switch (type) {
      case 'service-requests':
        data = serviceRequests
        filename = 'service-requests.json'
        break
      case 'reports':
        data = reports
        filename = 'reports.json'
        break
      case 'users':
        data = users
        filename = 'users.json'
        break
      default:
        return
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${type} data successfully!`)
  }

  const getStatusBadge = (status: string): React.JSX.Element => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'pending': { variant: 'outline', color: 'text-yellow-600 border-yellow-600' },
      'in-progress': { variant: 'default', color: 'text-blue-600 bg-blue-50 border-blue-600' },
      'in_progress': { variant: 'default', color: 'text-blue-600 bg-blue-50 border-blue-600' },
      'processing': { variant: 'default', color: 'text-blue-600 bg-blue-50 border-blue-600' },
      'ready': { variant: 'default', color: 'text-green-600 bg-green-50 border-green-600' },
      'ready_for_pickup': { variant: 'default', color: 'text-green-600 bg-green-50 border-green-600' },
      'completed': { variant: 'secondary', color: 'text-gray-600' },
      'resolved': { variant: 'secondary', color: 'text-green-600 bg-green-50' },
      'rejected': { variant: 'destructive', color: 'text-red-600' }
    }

    const config = variants[status] || variants['pending']
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string): React.JSX.Element => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={colors[priority] || colors['low']}>
        {priority}
      </Badge>
    )
  }

  const getCategoryBadge = (category: string): React.JSX.Element => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800',
      'event': 'bg-purple-100 text-purple-800',
      'alert': 'bg-orange-100 text-orange-800',
      'emergency': 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={colors[category] || colors['general']}>
        {category}
      </Badge>
    )
  }

  const filteredServiceRequests = serviceRequests.filter(req =>
    req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  

  const filteredReports = reports.filter(rep =>
    rep.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Ugnayan Admin</h1>
                <p className="text-green-100 text-sm">Barangay Irisan Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-sm font-medium">{officialInfo.name}</p>
                <p className="text-xs text-green-100">{officialInfo.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-white hover:bg-green-800"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Activity className="h-8 w-8" />
                    Welcome, {officialInfo.name}
                  </CardTitle>
                  <CardDescription className="text-green-100 text-lg mt-2">
                    {officialInfo.role} - Administrative Dashboard
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    loadData()
                    loadUsers()
                    loadAnnouncements()
                    toast.success('Dashboard refreshed!')
                  }}
                  className="bg-white text-green-700 hover:bg-green-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalServiceRequests}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pendingServiceRequests} pending
                </p>
              </CardContent>
            </Card>

            

            

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.totalReports}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.urgentReports} urgent • {stats.resolvedReports} resolved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowAnnouncementDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('service-requests')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Service Requests
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAllServiceRequestsDialog(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Service Requests
                </Button>
                
                
                
                <Button
                  variant="outline"
                  onClick={() => setShowAllReportsDialog(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Reports
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('reports')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Tabs defaultValue="service-requests" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="service-requests">
                <FileText className="h-4 w-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="reports">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="announcements">
                <Bell className="h-4 w-4 mr-2" />
                Announcements
              </TabsTrigger>
            </TabsList>

            {/* Service Requests Tab */}
            <TabsContent value="service-requests">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Requests</CardTitle>
                      <CardDescription>Manage document service requests from residents</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredServiceRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">
                              No service requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredServiceRequests.map((request) => (
                            <TableRow key={request.referenceId}>
                              <TableCell className="font-mono text-sm">{request.referenceId}</TableCell>
                              <TableCell className="font-medium">{request.fullName}</TableCell>
                              <TableCell>{request.documentType}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{request.email}</div>
                                  <div className="text-gray-500">{request.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={request.status}
                                    onValueChange={(value: string) => handleUpdateRequestStatus(request.referenceId, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="ready">Ready</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedRequest(request)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenReply(
                                      request.referenceId,
                                      'service-request',
                                      { email: request.email, phone: request.phone, name: request.fullName }
                                    )}
                                    title="Send Reply"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewReplies(request.referenceId)}
                                    title="View Reply History"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                  {(request.status === 'completed' || request.status === 'rejected') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteServiceRequest(request.referenceId)}
                                      title="Delete Request"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            

            

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reports</CardTitle>
                      <CardDescription>Review and respond to community reports</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-500">
                              No reports found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredReports.map((report) => (
                            <TableRow key={report.referenceId}>
                              <TableCell className="font-mono text-sm">{report.referenceId}</TableCell>
                              <TableCell className="capitalize">{report.reportType}</TableCell>
                              <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">{report.fullName}</div>
                                  <div className="text-gray-500">{report.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">{report.location}</TableCell>
                              <TableCell>{new Date(report.submittedAt).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(report.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={report.status}
                                    onValueChange={(value: string) => handleUpdateReportStatus(report.referenceId, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedReport(report)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenReply(
                                      report.referenceId,
                                      'report',
                                      { email: report.email, phone: report.phone, name: report.fullName }
                                    )}
                                    title="Send Reply"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewReplies(report.referenceId)}
                                    title="View Reply History"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                  {(report.status === 'resolved' || report.status === 'rejected') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteReport(report.referenceId)}
                                      title="Delete Report"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Registered Users</CardTitle>
                      <CardDescription>View and manage community members</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p>No registered users found</p>
                              <p className="text-xs mt-1">Users will appear here once they register</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-mono text-sm">{user.id}</TableCell>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{user.address}</TableCell>
                              <TableCell>{new Date(user.registeredAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <Card>
                <CardHeader>
                  <CardTitle>Community Announcements</CardTitle>
                  <CardDescription>Manage barangay announcements and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p>No announcements yet</p>
                          <p className="text-xs mt-1">Create your first announcement using the button above</p>
                        </div>
                      ) : (
                        announcements.map((announcement) => (
                          <Card key={announcement.id} className="border-l-4 border-l-green-500">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                  <div className="flex items-center gap-2 mt-2">
                                    {getCategoryBadge(announcement.category)}
                                    {getPriorityBadge(announcement.priority)}
                                    <span className="text-xs text-gray-500">
                                      {new Date(announcement.postedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                    title="Delete Announcement"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="max-w-2xl z-[11000]">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Post an announcement to inform the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter announcement content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newAnnouncement.category}
                  onValueChange={(value: 'general' | 'event' | 'alert' | 'emergency') =>
                    setNewAnnouncement({ ...newAnnouncement, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className="z-[11000]">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setNewAnnouncement({ ...newAnnouncement, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={5} className="z-[11000]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl z-[11000]">
          <DialogHeader>
            <DialogTitle>Send Reply</DialogTitle>
            <DialogDescription>
              Reply to {replyType === 'service-request' ? 'Service Request' : 'Report'} {replyReferenceId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Recipient Information</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Name:</strong> {replyRecipient.name}</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <strong>Email:</strong> {replyRecipient.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <strong>Phone:</strong> {replyRecipient.phone || 'Not provided'}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="reply-message">Your Message</Label>
              <Textarea
                id="reply-message"
                placeholder="Type your response here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={8}
                className="mt-2"
              />
            </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ℹ️ This message will be sent to: <strong>{replyRecipient.email}</strong>{replyRecipient.phone && (<> and <strong>{replyRecipient.phone}</strong> via SMS</>)}
          </p>
        </div>
        {replyType === 'service-request' && (
          <div>
            <Label htmlFor="reply-attachments" className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attach Files (optional)
            </Label>
            <Input
              id="reply-attachments"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="mt-2"
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                const previews: Array<{ name: string; size: number; type: string; dataUrl: string }> = []
                for (const file of files) {
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = () => reject(reader.error as unknown as string)
                    reader.readAsDataURL(file)
                  })
                  previews.push({ name: file.name, size: file.size, type: file.type, dataUrl })
                }
                setReplyFiles(previews)
              }}
            />
            {replyFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {replyFiles.map((f) => (
                  <div key={f.name} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[60%]">{f.name}</span>
                    <span className="text-gray-500">{Math.round(f.size / 1024)} KB</span>
                    <a href={f.dataUrl} download className="text-green-700 hover:underline">Preview</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowReplyDialog(false)}
                disabled={isSendingReply}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSendingReply}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSendingReply ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reply History Dialog */}
      <Dialog open={showRepliesDialog} onOpenChange={setShowRepliesDialog}>
        <DialogContent className="max-w-3xl z-[10000]">
          <DialogHeader>
            <DialogTitle>Reply History</DialogTitle>
            <DialogDescription>
              All replies sent for this request
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-4">
              {repliesHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No replies yet</p>
                </div>
              ) : (
                repliesHistory.map((reply) => (
                  <Card key={reply.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{reply.officialName}</p>
                          <p className="text-sm text-gray-500">{reply.officialRole}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(reply.sentAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(reply.sentAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{reply.message}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{reply.recipientEmail}</span>
                        </div>
                        {reply.recipientPhone && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{reply.recipientPhone}</span>
                          </div>
                        )}
                        <Badge className={reply.emailSent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {reply.emailSent ? '✓ Email Sent' : 'Email Pending'}
                        </Badge>
                        {reply.recipientPhone && (
                          <Badge className={reply.smsSent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {reply.smsSent ? '✓ SMS Sent' : 'SMS Pending'}
                          </Badge>
                        )}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {reply.attachments.map((att) => (
                              <a key={att.name} href={att.dataUrl} download className="text-sm text-green-700 hover:underline">
                                {att.name} ({Math.round(att.size / 1024)} KB)
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Service Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="z-[11000]">
            <DialogHeader>
              <DialogTitle>Service Request Details</DialogTitle>
              <DialogDescription>Reference ID: {selectedRequest.referenceId}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <p className="text-sm mt-1">{selectedRequest.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm mt-1">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm mt-1">{selectedRequest.phone}</p>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <p className="text-sm mt-1">{selectedRequest.address}</p>
              </div>
              <div>
                <Label>Document Type</Label>
                <p className="text-sm mt-1">{selectedRequest.documentType}</p>
              </div>
              <div>
                <Label>Purpose</Label>
                <p className="text-sm mt-1">{selectedRequest.purpose}</p>
              </div>
              {selectedRequest.additionalInfo && (
                <div>
                  <Label>Additional Info</Label>
                  <p className="text-sm mt-1">{selectedRequest.additionalInfo}</p>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <Label>Submitted</Label>
                <p className="text-sm mt-1">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Service Requests View */}
      <Dialog open={showAllServiceRequestsDialog} onOpenChange={setShowAllServiceRequestsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[11000]">
          <DialogHeader>
            <DialogTitle>All Service Requests</DialogTitle>
            <DialogDescription>Browse all submitted service requests</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">No service requests</TableCell>
                  </TableRow>
                ) : (
                  serviceRequests.map((request) => (
                    <TableRow key={request.referenceId}>
                      <TableCell className="font-mono text-sm">{request.referenceId}</TableCell>
                      <TableCell className="font-medium">{request.fullName}</TableCell>
                      <TableCell>{request.documentType}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.email}</div>
                          <div className="text-gray-500">{request.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      

      
      

      {/* Full Reports View */}
      <Dialog open={showAllReportsDialog} onOpenChange={setShowAllReportsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[11000]">
          <DialogHeader>
            <DialogTitle>All Reports</DialogTitle>
            <DialogDescription>Browse all submitted community reports</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">No reports</TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.referenceId}>
                      <TableCell className="font-mono text-sm">{report.referenceId}</TableCell>
                      <TableCell className="capitalize">{report.reportType}</TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{report.fullName}</div>
                          <div className="text-gray-500">{report.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.location}</TableCell>
                      <TableCell>{new Date(report.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Report Details Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="z-[11000]">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>Reference ID: {selectedReport.referenceId}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reporter Name</Label>
                <p className="text-sm mt-1">{selectedReport.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm mt-1">{selectedReport.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm mt-1">{selectedReport.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Type</Label>
                  <p className="text-sm mt-1 capitalize">{selectedReport.reportType}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <p className="text-sm mt-1">{selectedReport.location}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
              </div>
              <div>
                <Label>Submitted</Label>
                <p className="text-sm mt-1">{new Date(selectedReport.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">Barangay Irisan</h3>
              <p className="text-gray-300 text-sm">
                Administrative portal for managing community services and operations
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Contact Information</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (074) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  irisan.baguio@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Purok 18, Baguio City
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Office Hours</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monday - Friday
                </li>
                <li>8:00 AM - 5:00 PM</li>
                <li className="text-gray-400">Weekends & Holidays: Closed</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Barangay Irisan. Developed by UC College of IT Students.</p>
            <p className="mt-1">Dalog, De Vera, Manzano</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
