import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/database'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { username, password, email, phone, fullName, address } = body
    if (!username || !password || !email || !phone || !fullName || !address) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }
    const user = await createUser({ username, password, email, phone, fullName, address })
    return NextResponse.json({ success: true, message: 'User registered successfully', user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    const status = message === 'Username or email already exists' ? 409 : 500
    return NextResponse.json({ success: false, message }, { status })
  }
}
