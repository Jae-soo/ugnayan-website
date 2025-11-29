'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface OfficialLoginProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess: (official: { username: string; role: string; name: string }) => void
}

export default function OfficialLogin({ open, onOpenChange, onLoginSuccess }: OfficialLoginProps): React.JSX.Element {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Demo credentials for barangay officials
  const demoAccounts = [
    { username: 'captain', password: 'captain123', role: 'Barangay Captain', name: 'Juan Dela Cruz' },
    { username: 'secretary', password: 'secretary123', role: 'Barangay Secretary', name: 'Maria Santos' },
    { username: 'kagawad', password: 'kagawad123', role: 'Kagawad', name: 'Pedro Reyes' },
    { username: 'admin', password: 'admin123', role: 'Administrator', name: 'Admin User' }
  ]

  const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const account = demoAccounts.find(
        (acc) => acc.username === username && acc.password === password
      )

      if (account) {
        // Store login info
        localStorage.setItem('official', JSON.stringify({
          username: account.username,
          role: account.role,
          name: account.name,
          loginTime: new Date().toISOString()
        }))

        toast.success(`Welcome back, ${account.name}!`)
        onLoginSuccess({
          username: account.username,
          role: account.role,
          name: account.name
        })
        onOpenChange(false)
        setUsername('')
        setPassword('')
      } else {
        setError('Invalid username or password. Please try again.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[11000]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Official Login</DialogTitle>
          <DialogDescription className="text-center">
            Login to access the administrative dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Captain:</strong> captain / captain123</p>
              <p><strong>Secretary:</strong> secretary / secretary123</p>
              <p><strong>Kagawad:</strong> kagawad / kagawad123</p>
              <p><strong>Admin:</strong> admin / admin123</p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
