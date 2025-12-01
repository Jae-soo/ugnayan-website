import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database'

export async function GET() {
  const status = await checkDatabaseHealth()
  const http = status.status === 'healthy' ? 200 : 500
  return NextResponse.json(status, { status: http })
}
