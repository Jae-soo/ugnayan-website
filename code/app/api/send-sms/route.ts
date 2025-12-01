import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID_HERE'
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN_HERE'
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || 'YOUR_TWILIO_PHONE_NUMBER_HERE'

let twilioClient: ReturnType<typeof twilio> | null = null
if (accountSid !== 'YOUR_TWILIO_ACCOUNT_SID_HERE' && authToken !== 'YOUR_TWILIO_AUTH_TOKEN_HERE') {
  try { twilioClient = twilio(accountSid, authToken) } catch {}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { to, message, referenceId, type } = body
    if (!to || !message) { return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 }) }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanedPhone = to.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format. Use international format: +639XXXXXXXXX' }, { status: 400 })
    }
    let formattedPhone = cleanedPhone
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) formattedPhone = '+63' + formattedPhone.substring(1)
      else if (formattedPhone.startsWith('9')) formattedPhone = '+63' + formattedPhone
      else formattedPhone = '+' + formattedPhone
    }
    if (!twilioClient) {
      return NextResponse.json({ success: false, error: 'SMS service not configured', details: 'Please add your TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER' }, { status: 500 })
    }
    const smsBody = `Reference: ${referenceId || 'N/A'}\nType: ${getTypeLabel(type)}\n\n${message}`
    const twilioMessage = await twilioClient.messages.create({ body: smsBody, from: twilioPhoneNumber, to: formattedPhone })
    return NextResponse.json({ success: true, message: 'SMS notification sent successfully', messageId: twilioMessage.sid, recipient: formattedPhone, status: twilioMessage.status })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send SMS notification' }, { status: 500 })
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
