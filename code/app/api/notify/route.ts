import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'

type Channels = 'email' | 'sms'
type NotifyBody = {
  channels?: Channels | Channels[]
  toEmail?: string
  toPhone?: string
  subject?: string
  message: string
  referenceId?: string
  type?: string
  attachments?: Array<{ filename: string; contentBase64: string }>
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: NotifyBody = await request.json()
    const {
      channels, // array like ['email','sms'] or single channel string
      toEmail,
      toPhone,
      subject,
      message,
      referenceId,
      type,
      attachments
    } = body

    if (!message || (!toEmail && !toPhone)) {
      return NextResponse.json({ success: false, error: 'Missing recipient or message' }, { status: 400 })
    }

    const requested = Array.isArray(channels)
      ? channels
      : typeof channels === 'string'
        ? [channels]
        : ['email']

    const results: Record<string, unknown> = {}

    // Email
    if (requested.includes('email') && toEmail) {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        results.email = { sent: false, error: 'RESEND_API_KEY not configured' }
      } else {
        const resend = new Resend(apiKey)
        const { data, error } = await resend.emails.send({
          from: 'Barangay Irisan <onboarding@resend.dev>',
          to: [toEmail],
          subject: subject || `Re: ${type || 'Request'} ${referenceId || ''}`.trim(),
          html: `<div>Reference: ${referenceId || 'N/A'}<br/>Type: ${getTypeLabel(type)}<br/><pre>${escapeHtml(message)}</pre></div>`,
          attachments: Array.isArray(attachments)
            ? attachments.map((a) => ({ filename: a.filename, content: a.contentBase64 }))
            : undefined
        })
        results.email = { sent: !error, id: data?.id ?? null, error: error?.message }
      }
    }

    // SMS
    if (requested.includes('sms') && toPhone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
      if (!accountSid || !authToken || !twilioPhoneNumber) {
        results.sms = { sent: false, error: 'Twilio not configured' }
      } else {
        const client = twilio(accountSid, authToken)
        const cleaned = normalizePhone(toPhone)
        const smsBody = `Reference: ${referenceId || 'N/A'}\nType: ${getTypeLabel(type)}\n\n${message}`
        const msg = await client.messages.create({ body: smsBody, from: twilioPhoneNumber, to: cleaned })
        results.sms = { sent: true, id: msg.sid, status: msg.status, to: cleaned }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send notifications' }, { status: 500 })
  }
}

function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    'service-request': 'Service Request',
    'document-request': 'Document Request',
    'complaint': 'Complaint',
    'report': 'Report'
  }
  return (type && map[type]) || 'General'
}

function normalizePhone(input: string): string {
  let p = input.replace(/[\s\-\(\)]/g, '')
  if (!p.startsWith('+')) {
    if (p.startsWith('0')) p = '+63' + p.slice(1)
    else if (p.startsWith('9')) p = '+63' + p
    else p = '+' + p
  }
  return p
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] as string))
}
