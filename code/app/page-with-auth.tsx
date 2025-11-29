'use client'

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
  LogOut,
  LayoutDashboard,
  UserCircle
} from 'lucide-react'
import ServiceRequestForm from '@/components/ServiceRequestForm'
import ReportForm from '@/components/ReportForm'
import CommunityMap from '@/components/CommunityMap'
import AnnouncementsBoard from '@/components/AnnouncementsBoard'
import FeedbackSystem from '@/display/FeedbackSystem'
import EmergencyContacts from '@/display/EmergencyContacts'
import MyRequests from '@/components/MyRequests'
import RealTimeClock from '@/components/RealTimeClock'
import OfficialLogin from '@/components/OfficialLogin'
import ChatbotWidget from '@/components/ChatbotWidget'
import AdminDashboard from '@/components/AdminDashboard'
import UserRegistration from '@/components/UserRegistration'
import UserLogin from '@/components/UserLogin'
import UserProfile from '@/components/UserProfile'
import { useSpacetimeDB } from '@/hooks/useSpacetime'
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from 'sonner'

export default function UgnayanAppWithAuth(): React.JSX.Element {
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
          console.log("Farcaster SDK initialized successfully");
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error);
        }
      };
      initializeFarcaster();
    }, [])

  const { connected, userProfile, statusMessage } = useSpacetimeDB()
  const [activeTab, setActiveTab] = useState<string>('home')
  const [loginOpen, setLoginOpen] = useState<boolean>(false)
  const [officialLoginOpen, setOfficialLoginOpen] = useState<boolean>(false)
  const [registerOpen, setRegisterOpen] = useState<boolean>(false)
  const [profileOpen, setProfileOpen] = useState<boolean>(false)
  const [loggedInOfficial, setLoggedInOfficial] = useState<{
    username: string
    role: string
    name: string
  } | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const stored = window.localStorage.getItem('official')
    if (!stored) {
      return null
    }
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse stored official:', error)
      return null
    }
  })

  const handleOfficialLoginSuccess = (official: { username: string; role: string; name: string }): void => {
    setLoggedInOfficial(official)
  }

  const handleUserLoginSuccess = (): void => {
    toast.success('Welcome back!')
  }

  const handleRegisterSuccess = (): void => {
    toast.success('Registration successful! You are now logged in.')
  }

  const handleOfficialLogout = (): void => {
    localStorage.removeItem('official')
    setLoggedInOfficial(null)
    setActiveTab('home')
    toast.success('Official logged out')
  }

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
              
              {/* Connection Status */}
              {!connected && (
                <Badge variant="secondary" className="bg-yellow-600 text-white px-3 py-2">
                  {statusMessage}
                </Badge>
              )}
              
              {/* User Status */}
              {userProfile ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setProfileOpen(true)}
                    className="text-white hover:bg-green-800"
                  >
                    <UserCircle className="h-5 w-5 mr-2" />
                    {userProfile.fullName}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setLoginOpen(true)}
                  className="bg-white text-green-700 hover:bg-green-50"
                  disabled={!connected}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {connected ? 'Sign In' : 'Connecting...'}
                </Button>
              )}
              
              {/* Official Login */}
              {loggedInOfficial ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white text-green-700 px-3 py-2">
                    {loggedInOfficial.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOfficialLogout}
                    className="text-white hover:bg-green-800"
                    title="Official Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setOfficialLoginOpen(true)}
                  className="bg-transparent border-white text-white hover:bg-green-800"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Official
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className={`grid gap-2 bg-white p-2 shadow-md h-auto ${loggedInOfficial ? 'grid-cols-4 lg:grid-cols-9' : 'grid-cols-4 lg:grid-cols-8'}`}>
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
            {loggedInOfficial && (
              <TabsTrigger value="admin" className="flex flex-col items-center gap-1 py-3 bg-green-50">
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-xs">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to Barangay Irisan</CardTitle>
                <CardDescription className="text-green-100">
                  {userProfile ? `Hello, ${userProfile.fullName}! ` : ''}
                  Your digital gateway to community services and assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">
                  Ugnayan is your one-stop platform for accessing barangay services, reporting issues, 
                  and staying connected with our community in Baguio City.
                </p>
                {!userProfile && (
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4">
                    <p className="text-sm mb-3">Create an account to access all services and track your requests!</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => setRegisterOpen(true)}
                      className="bg-white text-green-700 hover:bg-green-50"
                      disabled={!connected}
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      {connected ? 'Create Account' : 'Connecting...'}
                    </Button>
                  </div>
                )}
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
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>8:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span className="font-medium">Sunday:</span>
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

          {/* Other Tabs */}
          <TabsContent value="services"><ServiceRequestForm /></TabsContent>
          <TabsContent value="report"><ReportForm /></TabsContent>
          <TabsContent value="map"><CommunityMap /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsBoard /></TabsContent>
          <TabsContent value="feedback"><FeedbackSystem /></TabsContent>
          <TabsContent value="emergency"><EmergencyContacts /></TabsContent>
          <TabsContent value="myrequests"><MyRequests /></TabsContent>

          {/* Admin Dashboard */}
          {loggedInOfficial && (
            <TabsContent value="admin">
              <AdminDashboard officialInfo={loggedInOfficial} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Modals */}
      <OfficialLogin 
        open={officialLoginOpen} 
        onOpenChange={setOfficialLoginOpen}
        onLoginSuccess={handleOfficialLoginSuccess}
      />
      
      <UserLogin
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleUserLoginSuccess}
        onRegisterClick={() => {
          setLoginOpen(false)
          setRegisterOpen(true)
        }}
      />
      
      <UserRegistration
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleRegisterSuccess}
      />
      
      <UserProfile
        open={profileOpen}
        onOpenChange={setProfileOpen}
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
                A community-based barangay service management system with real-time data persistence using SpacetimeDB.
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
            <p>&copy; 2025 Barangay Irisan. Developed with SpacetimeDB.</p>
            <p className="mt-1">Dalog, De Vera, Manzano</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
