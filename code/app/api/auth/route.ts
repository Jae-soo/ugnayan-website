import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByUsername, verifyUserPassword } from '@/lib/database'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const action = (body.action || '').toLowerCase()
  if (action === 'register') {
    const { username, password, email, phone, fullName, address } = body
    if (!username || !password || !email || !phone || !fullName || !address) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }
    try {
      const user = await createUser({ username, password, email, phone, fullName, address })
      return NextResponse.json({ success: true, message: 'User registered successfully', user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      const status = message === 'Username or email already exists' ? 409 : 500
      return NextResponse.json({ success: false, message }, { status })
    }
  }

  if (action === 'login') {
    const { username, password } = body
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 })
    }
    const user = await findUserByUsername(username)
    if (!user) return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
    const ok = await verifyUserPassword(password, user.password)
    if (!ok) return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
    return NextResponse.json({ success: true, message: 'Login successful', user: { id: user._id.toString(), username: user.username, email: user.email, phone: user.phone, fullName: user.fullName, address: user.address, isAdmin: user.isAdmin } })
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
}
