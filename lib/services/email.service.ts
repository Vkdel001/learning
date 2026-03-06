/**
 * Email Service using Brevo API
 * Handles sending OTP emails to users
 */

import { BrevoClient } from '@getbrevo/brevo';

export interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

/**
 * Send OTP email to user using Brevo API
 */
export async function sendOTPEmail({
  to,
  name,
  otp,
}: SendOTPEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  // For development: Always log OTP to console
  console.log('\n' + '='.repeat(60));
  console.log('📧 OTP EMAIL');
  console.log('='.repeat(60));
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`OTP Code: ${otp}`);
  console.log('='.repeat(60) + '\n');

  // If no API key, only log to console (development mode)
  if (!apiKey || apiKey === 'your-brevo-api-key-here') {
    console.log('⚠️  Brevo API key not configured - OTP logged to console only');
    return Promise.resolve();
  }

  try {
    // Initialize Brevo client
    const client = new BrevoClient({
      apiKey: apiKey,
    });

    // Send email
    await client.transactionalEmails.sendTransacEmail({
      subject: 'Your OTP Code - AI Tutor Mauritius',
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🇲🇺 AI Tutor Mauritius</h1>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>Your One-Time Password (OTP) for login is:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                  <p>AI Tutor Mauritius - Empowering Students 🎓</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'AI Tutor Mauritius',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@aitutor.mu',
      },
      to: [{ email: to, name }],
    });

    console.log('✅ OTP email sent successfully via Brevo');
  } catch (error: any) {
    console.error('Failed to send OTP email via Brevo:', error);
    // Don't throw - we already logged OTP to console
    // In production, you might want to throw here
    console.log('⚠️  Email sending failed, but OTP was logged to console');
  }
}
