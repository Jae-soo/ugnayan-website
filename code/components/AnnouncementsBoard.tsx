'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Users, AlertCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface Announcement {
  id: string
  title: string
  category: string
  content: string
  postedAt: string
  eventDate?: string
  priority: string
}

export default function AnnouncementsBoard(): React.JSX.Element {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    const load = (): void => {
      try {
        const stored = localStorage.getItem('barangay_announcements')
        const deletedIdsRaw = localStorage.getItem('deleted_barangay_announcements')
        const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) as string[] : []
        if (stored) {
          const anns = JSON.parse(stored) as Announcement[]
          const filtered = anns.filter(a => !deletedIds.includes(a.id))
          setAnnouncements(filtered)
        } else {
          setAnnouncements([])
        }
      } catch {
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(() => load(), 0)
    return () => clearTimeout(timer)
  }, [])

  const upcomingEvents = announcements.filter((a) => a.category === 'event').length
  const activeAlerts = announcements.filter((a) => a.category === 'alert' || a.category === 'emergency').length

  const getCategoryIcon = (category: string): React.JSX.Element => {
    switch (category) {
      case 'event': return <Users className="h-4 w-4" />
      case 'alert': return <AlertCircle className="h-4 w-4" />
      case 'emergency': return <AlertCircle className="h-4 w-4" />
      case 'general': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'event': return 'bg-blue-100 text-blue-800'
      case 'alert': return 'bg-red-100 text-red-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'general': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadge = (priority: string): React.JSX.Element => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="ml-2">URGENT</Badge>
      case 'important':
        return <Badge variant="default" className="ml-2 bg-orange-600">Important</Badge>
      default:
        return <></>
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bell className="h-6 w-6" />
            Community Announcements & Updates
          </CardTitle>
          <CardDescription className="text-purple-100">
            Stay informed about barangay events, alerts, and important notices
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {loading && (
              <p className="text-gray-600">Loading announcements...</p>
            )}
            {!loading && error && (
              <p className="text-red-600">{error}</p>
            )}
            {!loading && !error && announcements.length === 0 && (
              <p className="text-gray-600">No announcements yet.</p>
            )}
            {!loading && !error && announcements.map((announcement: Announcement) => (
              <Card id={`announcement-${announcement.id}`} key={announcement.id} className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getCategoryColor(announcement.category)}>
                          {getCategoryIcon(announcement.category)}
                          <span className="ml-1 capitalize">{announcement.category}</span>
                        </Badge>
                        {getPriorityBadge(announcement.priority)}
                      </div>
                      <CardTitle className="text-xl mb-1">{announcement.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{announcement.content}</p>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(announcement.eventDate || announcement.postedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      {announcements.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{upcomingEvents}</p>
              <p className="text-sm text-gray-600">scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
              <p className="text-sm text-gray-600">requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Total Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{announcements.length}</p>
              <p className="text-sm text-gray-600">posted</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
