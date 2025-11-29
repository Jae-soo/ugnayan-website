'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LogIn, Loader2, UserPlus } from 'lucide-react'
import { useSpacetimeDB } from '@/hooks/useSpacetime'
import { toast } from 'sonner'

interface UserLoginProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess: () => void
  onRegisterClick: () => void
}

export default function UserLogin({ open, onOpenChange, onLoginSuccess, onRegisterClick }: UserLoginProps): React.JSX.Element {
  const { loginUser, connected, statusMessage } = useSpacetimeDB()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!connected) {
      toast.error('Not connected to database. Please wait...')
      return
    }

    if (!formData.username || !formData.password) {
      toast.error('Please enter username and password')
      return
    }

    setLoading(true)
    
    try {
      loginUser(formData.username, formData.password)

      // Wait for auth event
      setTimeout(() => {
        // The statusMessage will be updated by the auth event callback
        if (statusMessage.includes('successful')) {
          toast.success('Login successful!')
          setLoading(false)
          onLoginSuccess()
          onOpenChange(false)
          setFormData({ username: '', password: '' })
        } else {
          toast.error(statusMessage || 'Login failed')
          setLoading(false)
        }
      }, 1500)
    } catch (error) {
      setLoading(false)
      toast.error('Login failed. Please try again.')
      console.error('Login error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <LogIn className="h-6 w-6 text-green-600" />
            Resident Login
          </DialogTitle>
          <DialogDescription>
            Sign in to your Ugnayan account to access services
          </DialogDescription>
        </DialogHeader>

        {!connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="text-yellow-800">{statusMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter your username"
              required
              disabled={loading || !connected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
              disabled={loading || !connected}
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !connected}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onRegisterClick()
              }}
              disabled={loading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
