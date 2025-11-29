'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Users, LogIn, ArrowRight } from 'lucide-react'

interface WelcomePageProps {
  onResidentContinue: () => void
  onOfficialLogin: () => void
}

export default function WelcomePage({ onResidentContinue, onOfficialLogin }: WelcomePageProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Shield className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Ugnayan</h1>
          <p className="text-xl text-gray-600">Barangay Irisan Service Portal</p>
          <p className="text-gray-500 mt-2">Baguio City, Benguet</p>
        </div>

        {/* Welcome Message */}
        <Card className="mb-6 border-2 border-green-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Our Community Portal</CardTitle>
            <CardDescription className="text-center text-base">
              Your digital gateway to barangay services, announcements, and community assistance
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Resident Access */}
          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-200 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">I’m a Resident</CardTitle>
              <CardDescription className="text-base">
                Access barangay services without logging in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Request documents and certificates</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>File reports and complaints</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>View community map and announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Access emergency contacts and information</span>
                </li>
              </ul>
              <Button 
                onClick={onResidentContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              >
                Continue as Resident
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-xs text-center text-gray-500 pt-2">
                No account needed • Instant access
              </p>
            </CardContent>
          </Card>

          {/* Official Access */}
          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-green-200 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">I’m an Official</CardTitle>
              <CardDescription className="text-base">
                Login to access the administrative dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage service requests and reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Post announcements and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review and respond to complaints</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitor community activities</span>
                </li>
              </ul>
              <Button 
                onClick={onOfficialLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Official Login
              </Button>
              <p className="text-xs text-center text-gray-500 pt-2">
                For authorized personnel only
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <Card className="bg-white/50 backdrop-blur border-gray-200">
            <CardContent className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Contact:</strong> (074) 123-4567 • irisan.baguio@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
