import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { to, subject, message, referenceId, type, attachments } = body
    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }
    if (!resend) {
      return NextResponse.json({ success: false, error: 'Email service not configured. Please add your RESEND_API_KEY.' }, { status: 500 })
    }
    const { data, error } = await resend.emails.send({
      from: 'Barangay Irisan <onboarding@resend.dev>',
      to: [to],
      subject,
      html: `<div>Reference: ${referenceId || 'N/A'}<br/>Type: ${getTypeLabel(type)}<br/><pre>${message}</pre></div>`
    })
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Email notification sent successfully', emailId: data?.id ?? null, recipient: to })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send email notification' }, { status: 500 })
  }
}

function getTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'service-request': 'Service Request',
    'document-request': 'Document Request',
    'complaint': 'Complaint',
    'report': 'Report'
  }
  return typeLabels[type] || 'General Inquiry'
}
