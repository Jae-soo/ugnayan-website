'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, Edit, Loader2, Mail, Phone, MapPin, Shield } from 'lucide-react'
import { useSpacetimeDB } from '@/hooks/useSpacetime'
import { toast } from 'sonner'

interface UserProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserProfile({ open, onOpenChange }: UserProfileProps): React.JSX.Element {
  const { userProfile, updateUserProfile, connected } = useSpacetimeDB()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: ''
  })

  const beginEditing = (): void => {
    if (!userProfile) return
    setFormData({
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address
    })
    setEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!connected) {
      toast.error('Not connected to database')
      return
    }

    setLoading(true)
    
    try {
      updateUserProfile(formData.email, formData.phone, formData.address)
      
      setTimeout(() => {
        toast.success('Profile updated successfully!')
        setLoading(false)
        setEditing(false)
      }, 1000)
    } catch (error) {
      setLoading(false)
      toast.error('Failed to update profile')
      console.error('Profile update error:', error)
    }
  }

  if (!userProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Profile Found</DialogTitle>
            <DialogDescription>
              Please register or log in to view your profile.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-green-600" />
            My Profile
          </DialogTitle>
          <DialogDescription>
            View and manage your account information
          </DialogDescription>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{userProfile.fullName}</h3>
                  <p className="text-sm text-gray-600">@{userProfile.username}</p>
                  {userProfile.isAdmin && (
                    <Badge variant="secondary" className="mt-1 bg-green-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={beginEditing}
                variant="outline"
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{userProfile.email}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{userProfile.phone}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{userProfile.address}</p>
              </CardContent>
            </Card>

            <div className="text-xs text-gray-500">
              <p>Account created: {new Date(Number(userProfile.createdAt) / 1000).toLocaleDateString()}</p>
              <p className="mt-1">Identity: {userProfile.identity.toHexString().substring(0, 16)}...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
