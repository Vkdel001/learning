/**
 * Email Service using Brevo API
 * Handles sending OTP emails to users
 */

export interface SendOTPEmailParams {
  to: string;
  name: string;
  otp: string;
}

/**
 * Send OTP email to user
 * 
 * NOTE: For development, OTP is logged to console.
 * In production, configure Brevo API properly.
 */
export async function sendOTPEmail({
  to,
  name,
  otp,
}: SendOTPEmailParams): Promise<void> {
  // For development: Log OTP to console
  console.log('\n' + '='.repeat(60));
  console.log('📧 OTP EMAIL');
  console.log('='.repeat(60));
  console.log(`To: ${to}`);
  console.log(`Name: ${name}`);
  console.log(`OTP Code: ${otp}`);
  console.log('='.repeat(60) + '\n');

  // TODO: Implement actual Brevo email sending for production
  // The Brevo package structure needs to be verified
  // For now, OTP is logged to console for testing
  
  return Promise.resolve();
}
