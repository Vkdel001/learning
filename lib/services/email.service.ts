import * as brevo from '@getbrevo/brevo';

/**
 * Email Service using Brevo API
 * Handles sending OTP emails to users
 */

// Initialize Brevo API client (skip in test environment)
let apiInstance: brevo.TransactionalEmailsApi | null = null;

if (process.env.NODE_ENV !== 'test') {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY || ''
  );
}

export interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

/**
 * Send OTP email to user
 */
export async function sendOTPEmail({
  to,
  name,
  otp,
}: SendOTPEmailParams): Promise<void> {
  // Skip sending in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log(`[TEST] Would send OTP ${otp} to ${to}`);
    return;
  }

  if (!apiInstance) {
    throw new Error('Email service not initialized');
  }

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = 'Your AI Tutor Login Code';
  sendSmtpEmail.to = [{ email: to, name }];
  sendSmtpEmail.sender = {
    name: 'AI Tutor Mauritius',
    email: 'noreply@aitutor.mu',
  };
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; letter-spacing: 8px; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Tutor Mauritius</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your login code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>AI Tutor Mauritius - Free education for all students</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}
