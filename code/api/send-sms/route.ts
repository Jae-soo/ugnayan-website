import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
// Get your credentials from: https://console.twilio.com/
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID_HERE';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN_HERE';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || 'YOUR_TWILIO_PHONE_NUMBER_HERE';

let twilioClient: ReturnType<typeof twilio> | null = null;

// Only initialize if credentials are provided
if (accountSid !== 'YOUR_TWILIO_ACCOUNT_SID_HERE' && authToken !== 'YOUR_TWILIO_AUTH_TOKEN_HERE') {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { to, message, referenceId, type } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedPhone = to.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use international format: +639XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Ensure phone number starts with country code
    let formattedPhone = cleanedPhone;
    if (!formattedPhone.startsWith('+')) {
      // Default to Philippines country code if not provided
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+63' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('9')) {
        formattedPhone = '+63' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    console.log('Sending SMS to:', formattedPhone);

    // Check if Twilio client is initialized
    if (!twilioClient) {
      console.error('Twilio client not initialized. Please configure your credentials.');
      return NextResponse.json(
        { 
          success: false, 
          error: 'SMS service not configured',
          details: 'Please add your TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER'
        },
        { status: 500 }
      );
    }

    try {
      // Create SMS message
      const smsBody = `
🏛️ Barangay Irisan Official Response

Reference: ${referenceId || 'N/A'}
Type: ${getTypeLabel(type)}

Message:
${message}

---
Barangay Irisan, Baguio City
📞 (074) 123-4567
`.trim();

      // Send SMS using Twilio
      const twilioMessage = await twilioClient.messages.create({
        body: smsBody,
        from: twilioPhoneNumber,
        to: formattedPhone,
      });

      console.log('SMS sent successfully:', twilioMessage.sid);

      return NextResponse.json({
        success: true,
        message: 'SMS notification sent successfully',
        messageId: twilioMessage.sid,
        recipient: formattedPhone,
        status: twilioMessage.status
      });

    } catch (smsError) {
      console.error('Twilio API error:', smsError);
      
      // Check for common Twilio errors
      if (smsError instanceof Error) {
        if (smsError.message.includes('credentials')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'SMS service authentication failed',
              details: 'Please verify your Twilio credentials at https://console.twilio.com/'
            },
            { status: 500 }
          );
        }
        
        if (smsError.message.includes('phone number')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid phone number or Twilio phone number not configured',
              details: 'Verify the recipient phone number and your Twilio phone number'
            },
            { status: 400 }
          );
        }
      }

      throw smsError;
    }

  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send SMS notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'service-request': 'Service Request',
    'document-request': 'Document Request',
    'complaint': 'Complaint',
    'report': 'Report'
  };
  return typeLabels[type] || 'General Inquiry';
}
