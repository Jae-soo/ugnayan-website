import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with your API key (set RESEND_API_KEY in environment)
const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { to, subject, message, referenceId, type, attachments } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.log('Sending email to:', to);

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: 'Barangay Irisan <onboarding@resend.dev>', // Change this to your verified domain
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a; margin: 0; font-size: 24px;">🏛️ Barangay Irisan</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Official Response</p>
              </div>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; color: #166534;"><strong>Reference ID:</strong> ${referenceId || 'N/A'}</p>
                <p style="margin: 5px 0 0 0; color: #166534;"><strong>Type:</strong> ${getTypeLabel(type)}</p>
              </div>

              <div style="margin: 30px 0;">
                <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Message:</h3>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #4b5563; background-color: #f9fafb; padding: 20px; border-radius: 6px;">${message}</div>
              </div>
              ${Array.isArray(attachments) && attachments.length > 0 ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Attachments:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${attachments.map((att: { name: string; size: number; dataUrl: string }) => `
                    <li style="margin: 6px 0;">
                      <a href="${att.dataUrl}" download style="color: #16a34a; text-decoration: none;">${att.name}</a>
                      <span style="color: #6b7280; font-size: 12px;"> (${Math.round(att.size / 1024)} KB)</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <div style="text-align: center; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 10px 0;"><strong>Barangay Irisan, Baguio City</strong></p>
                <p style="margin: 0;">📍 Irisan, Baguio City, Philippines</p>
                <p style="margin: 5px 0;">📞 (074) 123-4567</p>
                <p style="margin: 5px 0;">✉️ irisan.baguio@gmail.com</p>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                  This is an official communication from Barangay Irisan.<br>
                  Please do not reply to this email directly.
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        throw error
      }

      console.log('Email sent successfully:', data);

      return NextResponse.json({
        success: true,
        message: 'Email notification sent successfully',
        emailId: data?.id ?? null,
        recipient: to
      });

    } catch (emailError) {
      console.error('Resend API error:', emailError);
      
      // Check if API key is missing or invalid
      if (emailError instanceof Error && emailError.message.includes('API')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email service not configured. Please add your RESEND_API_KEY.',
            details: 'Get your API key from https://resend.com/api-keys'
          },
          { status: 500 }
        );
      }

      throw emailError;
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email notification',
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
