'use client'
export const dynamic = 'force-static'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  FileText, 
  AlertTriangle, 
  Map, 
  Bell, 
  MessageSquare,
  Phone,
  Clock,
  MapPin,
  Users,
  Shield,
  Lightbulb,
  CloudRain,
  Mountain,
  LogIn,
  LogOut
} from 'lucide-react'
import ServiceRequestForm from '@/components/ServiceRequestForm'
import ReportForm from '@/components/ReportForm'
import CommunityMapWrapper from '@/components/CommunityMapWrapper'
import AnnouncementsBoard from '@/components/AnnouncementsBoard'
import FeedbackSystem from '@/components/FeedbackSystem'
import EmergencyContacts from '@/components/EmergencyContacts'
import MyRequests from '@/components/MyRequests'
import RealTimeClock from '@/components/RealTimeClock'
import OfficialLogin from '@/components/OfficialLogin'
import ChatbotWidget from '@/components/ChatbotWidget'
import OfficialDashboard from '@/components/OfficialDashboard'
import WelcomePage from '@/components/WelcomePage'
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from 'sonner'
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function UgnayanApp(): React.JSX.Element {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth('promised-moving-017.app.ohara.ai')
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (document.readyState !== 'complete') {
            await new Promise(resolve => {
              if (document.readyState === 'complete') {
                resolve(void 0);
              } else {
                window.addEventListener('load', () => resolve(void 0), { once: true });
              }

            });
          }

          await sdk.actions.ready();
          console.log("Farcaster SDK initialized successfully - app fully loaded");
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error);
          setTimeout(async () => {
            try {
              await sdk.actions.ready();
              console.log('Farcaster SDK initialized on retry');
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError);
            }

          }, 1000);
        }

      };
      initializeFarcaster();
    }, []);
  const [activeTab, setActiveTab] = useState<string>('home')
  const [loginOpen, setLoginOpen] = useState<boolean>(false)
  const [loggedInOfficial, setLoggedInOfficial] = useState<{ username: string; role: string; name: string } | null>(null)
  const [showWelcome, setShowWelcome] = useState<boolean>(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('official')
      const visitedBefore = localStorage.getItem('visited_ugnayan')
      if (stored) {
        const official = JSON.parse(stored)
        setLoggedInOfficial(official)
        setShowWelcome(false)
      } else if (visitedBefore) {
        setShowWelcome(false)
      }
    } catch {
      // Ignore parse errors; keep defaults
    }
  }, [])

  const [latestAnnouncements, setLatestAnnouncements] = useState<Array<{ id: string; title: string; category: string; content: string; postedAt: string; eventDate?: string; priority: string }>>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true)
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null)

  useEffect(() => {
    const load = (): void => {
      try {
        const stored = localStorage.getItem('barangay_announcements')
        const deletedIdsRaw = localStorage.getItem('deleted_barangay_announcements')
        const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) as string[] : []
        const anns = stored ? JSON.parse(stored) as Array<{ id: string; title: string; category: string; content: string; postedAt?: string; eventDate?: string; priority: string }> : []
        const visible = anns.filter(a => !deletedIds.includes(a.id))
        const sorted = visible.sort((a, b) => {
          const da = new Date(a.postedAt || a.eventDate || 0).getTime()
          const db = new Date(b.postedAt || b.eventDate || 0).getTime()
          return db - da
        })
        setLatestAnnouncements(sorted.slice(0, 3) as Array<{ id: string; title: string; category: string; content: string; postedAt: string; eventDate?: string; priority: string }>)
        setAnnouncementsError(null)
      } catch {
        setLatestAnnouncements([])
        setAnnouncementsError(null)
      } finally {
        setLoadingAnnouncements(false)
      }
    }
    const timer = setTimeout(() => load(), 0)
    return () => clearTimeout(timer)
  }, [])

  const handleLoginSuccess = (official: { username: string; role: string; name: string }): void => {
    setLoggedInOfficial(official)
  }

  const handleLogout = (): void => {
    localStorage.removeItem('official')
    setLoggedInOfficial(null)
    setShowWelcome(true)
    setActiveTab('home')
    toast.success('Logged out successfully')
  }

  const handleResidentContinue = (): void => {
    localStorage.setItem('visited_ugnayan', 'true')
    setShowWelcome(false)
    toast.success('Welcome to Barangay Irisan!')
  }

  const handleOfficialLoginClick = (): void => {
    setLoginOpen(true)
  }

  // Show welcome page first
  if (showWelcome && !loggedInOfficial) {
    return (
      <>
        <WelcomePage 
          onResidentContinue={handleResidentContinue}
          onOfficialLogin={handleOfficialLoginClick}
        />
        <OfficialLogin 
          open={loginOpen} 
          onOpenChange={setLoginOpen}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    )
  }

  // If official is logged in, show the admin dashboard
  if (loggedInOfficial) {
    return <OfficialDashboard officialInfo={loggedInOfficial} onLogout={handleLogout} />
  }

  // Otherwise, show the resident dashboard
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
                <h1 className="text-3xl font-bold">Ugnayan</h1>
                <p className="text-green-100 text-sm">Barangay Irisan Service Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-800 text-white px-4 py-2">
                Baguio City
              </Badge>
              <RealTimeClock />
              <Button
                variant="secondary"
                onClick={() => setLoginOpen(true)}
                className="bg-white text-green-700 hover:bg-green-50"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Official Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid gap-2 bg-white p-2 shadow-md h-auto grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="home" className="flex flex-col items-center gap-1 py-3">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex flex-col items-center gap-1 py-3">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Services</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex flex-col items-center gap-1 py-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Report</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex flex-col items-center gap-1 py-3">
              <Map className="h-5 w-5" />
              <span className="text-xs">Map</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex flex-col items-center gap-1 py-3">
              <Bell className="h-5 w-5" />
              <span className="text-xs">News</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex flex-col items-center gap-1 py-3">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex flex-col items-center gap-1 py-3">
              <Phone className="h-5 w-5" />
              <span className="text-xs">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="myrequests" className="flex flex-col items-center gap-1 py-3">
              <Users className="h-5 w-5" />
              <span className="text-xs">My Requests</span>
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to Barangay Irisan</CardTitle>
                <CardDescription className="text-green-100">
                  Your digital gateway to community services and assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  Ugnayan is your one-stop platform for accessing barangay services, reporting issues, 
                  and staying connected with our community in Baguio City.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('services')}
                    className="bg-white text-green-700 hover:bg-green-50"
                  >
                    Request Services
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab('report')}
                    className="bg-green-800 text-white hover:bg-green-900"
                  >
                    Report an Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Latest Announcements</h2>
              {loadingAnnouncements && (
                <p className="text-gray-600">Loading announcements...</p>
              )}
              {!loadingAnnouncements && announcementsError && (
                <p className="text-red-600">{announcementsError}</p>
              )}
              {!loadingAnnouncements && !announcementsError && latestAnnouncements.length === 0 && (
                <p className="text-gray-600">No announcements yet.</p>
              )}
              {!loadingAnnouncements && !announcementsError && latestAnnouncements.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                  {latestAnnouncements.map((a) => (
                    <Card key={a.id} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{a.title}</CardTitle>
                        <CardDescription className="capitalize">{a.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-2">{a.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.eventDate || a.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <Button
                          className="mt-3"
                          onClick={() => {
                            setActiveTab('announcements')
                            setTimeout(() => {
                              const el = document.getElementById(`announcement-${a.id}`)
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }, 100)
                          }}
                        >
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Services */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Access Services</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setActiveTab('services')}
                >
                  <CardHeader>
                    <FileText className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle className="text-lg">Document Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Request barangay clearance, certificates, and permits online
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setActiveTab('report')}
                >
                  <CardHeader>
                    <AlertTriangle className="h-10 w-10 text-orange-600 mb-2" />
                    <CardTitle className="text-lg">Report Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      File complaints, report emergencies, or hazards in the area
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setActiveTab('map')}
                >
                  <CardHeader>
                    <Map className="h-10 w-10 text-green-600 mb-2" />
                    <CardTitle className="text-lg">Community Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      View transportation, streetlights, and hazard zones
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setActiveTab('announcements')}
                >
                  <CardHeader>
                    <Bell className="h-10 w-10 text-purple-600 mb-2" />
                    <CardTitle className="text-lg">Announcements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Stay updated with community news and events
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Emergency Contacts on Home */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">In Case of Emergency</h2>
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-red-600" />
                    Quick Contacts
                  </CardTitle>
                  <CardDescription>Immediate access to essential hotlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>911</span>
                          <Badge variant="secondary" className="text-xs">24/7</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">National Emergency Hotline</p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => window.location.href = 'tel:911'}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>(074) 123-4567</span>
                          <Badge variant="secondary" className="text-xs">Office</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">Barangay Irisan Office</p>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = 'tel:0741234567'}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>(074) 442-4216</span>
                          <Badge variant="secondary" className="text-xs">Hospital</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">Baguio General Hospital</p>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = 'tel:0744424216'}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setActiveTab('emergency')}>
                      View full emergency list
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barangay Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span className="font-medium">Weekends & Holidays:</span>
                    <span>Closed</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Address:</strong></p>
                  <p className="text-gray-700">Purok 18, Barangay Irisan</p>
                  <p className="text-gray-700">Baguio City, Benguet</p>
                  <p className="text-gray-700">Philippines 2600</p>
                </CardContent>
              </Card>
            </div>

            {/* Community Concerns */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Community Safety Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-6 w-6 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Streetlight Requests</h4>
                      <p className="text-sm text-gray-600">Report dark areas needing illumination</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mountain className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Landslide Alerts</h4>
                      <p className="text-sm text-gray-600">Report hazardous areas and slopes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CloudRain className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Flood Monitoring</h4>
                      <p className="text-sm text-gray-600">Report flooding and drainage issues</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Requests Tab */}
          <TabsContent value="services">
            <ServiceRequestForm />
          </TabsContent>

          {/* Report Issues Tab */}
          <TabsContent value="report">
            <ReportForm />
          </TabsContent>

          {/* Community Map Tab */}
          <TabsContent value="map">
            <CommunityMapWrapper />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <AnnouncementsBoard />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <FeedbackSystem />
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency">
            <EmergencyContacts />
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="myrequests">
            <MyRequests />
          </TabsContent>
        </Tabs>
      </main>

      {/* Login Modal */}
      <OfficialLogin 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">About Ugnayan</h3>
              <p className="text-gray-300 text-sm">
                A community-based barangay service management system designed to enhance 
                accessibility, transparency, and efficiency in Barangay Irisan.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('services')}>Request Services</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('report')}>Report Issues</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('emergency')}>Emergency Contacts</li>
                <li className="hover:text-white cursor-pointer" onClick={() => setActiveTab('feedback')}>Send Feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Contact Information</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📞 Barangay Hall: (074) 123-4567</li>
                <li>📧 Email: irisan.baguio@gmail.com</li>
                <li>📍 Purok 18, Barangay Irisan, Baguio City</li>
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
