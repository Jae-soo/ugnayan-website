'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus, Loader2 } from 'lucide-react'
import { useSpacetimeDB } from '@/hooks/useSpacetime'
import { toast } from 'sonner'

interface UserRegistrationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function UserRegistration({ open, onOpenChange, onSuccess }: UserRegistrationProps): React.JSX.Element {
  const { registerUser, connected, statusMessage } = useSpacetimeDB()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    fullName: '',
    address: ''
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!connected) {
      toast.error('Not connected to database. Please wait...')
      return
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!formData.username || !formData.email || !formData.phone || !formData.fullName || !formData.address) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    
    try {
      registerUser(
        formData.username,
        formData.password,
        formData.email,
        formData.phone,
        formData.fullName,
        formData.address
      )

      // Wait a bit for the reducer to process
      setTimeout(() => {
        toast.success('Registration successful! You can now use the services.')
        setLoading(false)
        onSuccess()
        onOpenChange(false)
        // Reset form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          phone: '',
          fullName: '',
          address: ''
        })
      }, 1500)
    } catch (error) {
      setLoading(false)
      toast.error('Registration failed. Please try again.')
      console.error('Registration error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="h-6 w-6 text-green-600" />
            Create Your Account
          </DialogTitle>
          <DialogDescription>
            Register to access Ugnayan services and manage your requests
          </DialogDescription>
        </DialogHeader>

        {!connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="text-yellow-800">{statusMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                required
                disabled={loading || !connected}
              />
              <p className="text-xs text-gray-500">3-32 characters, letters, numbers, ._-</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Dela Cruz"
                required
                disabled={loading || !connected}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                disabled={loading || !connected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 912 345 6789"
                required
                disabled={loading || !connected}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Complete Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Purok, Street, Barangay Irisan, Baguio City"
              required
              disabled={loading || !connected}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
                required
                disabled={loading || !connected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
                disabled={loading || !connected}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !connected}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
