import nodemailer from 'nodemailer'

// Create transporter using Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate OTP expiry time (10 minutes from now)
export function generateOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

// Send OTP verification email
export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'CDRA'}" <${process.env.MAIL_FROM_EMAIL || 'no-reply@cdra.local'}>`,
    to: email,
    subject: 'Verify Your Email - CBDRA Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CBDRA</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Community Based Disaster Response Application</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Verify Your Email Address</h2>
            
            ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
            
            <p>Thank you for registering with CBDRA. To complete your account setup, please verify your email address using the OTP code below:</p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="margin: 0; color: #495057; font-size: 16px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 15px 0;">${otp}</div>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 10 minutes</p>
            </div>
            
            <p>Enter this code on the verification page to activate your account and start using CDRA's disaster response features.</p>
            
            <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
              If you didn't create an account with CDRA, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px; text-align: center;">
              This is an automated message from CDRA. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      CDRA - Email Verification
      
      ${name ? `Hello ${name},` : 'Hello,'}
      
      Thank you for registering with CDRA. To complete your account setup, please verify your email address using the OTP code below:
      
      Verification Code: ${otp}
      
      This code expires in 10 minutes.
      
      Enter this code on the verification page to activate your account and start using CDRA's disaster response features.
      
      If you didn't create an account with CDRA, please ignore this email.
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`OTP email sent successfully to ${email}`)
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw new Error('Failed to send verification email')
  }
}

// Verify transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}

// Send incident allocation email notification
export async function sendAllocationEmail(params: {
  toEmail: string
  toName?: string
  incidentTitle: string
  incidentId: string | number
  allocationNote?: string
}): Promise<void> {
  const { toEmail, toName, incidentTitle, incidentId, allocationNote } = params

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'CDRA'}" <${process.env.MAIL_FROM_EMAIL || 'no-reply@cdra.local'}>`,
    to: toEmail,
    subject: `New Incident Assigned: ${incidentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Incident Assignment</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CBDRA</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Community Based Disaster Response Application</p>
          </div>
          <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Incident Assigned To You</h2>
            ${toName ? `<p>Hello ${toName},</p>` : '<p>Hello,</p>'}
            <p>An incident has been assigned to you via CDRA:</p>
            <ul style="color:#495057;">
              <li><strong>Incident:</strong> ${incidentTitle}</li>
              <li><strong>Reference ID:</strong> ${incidentId}</li>
            </ul>
            ${allocationNote ? `<p style="color:#495057"><strong>Note:</strong> ${allocationNote}</p>` : ''}
            <p>Please log in to your dashboard to review details and take action.</p>
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 30px;">This is an automated message from CDRA. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      CBDRA - Incident Assignment

      ${toName ? `Hello ${toName},` : 'Hello,'}

      An incident has been assigned to you via CDRA:
      - Incident: ${incidentTitle}
      - Reference ID: ${incidentId}

      ${allocationNote ? `Note: ${allocationNote}\n\n` : ''}
      Please log in to your dashboard to review details and take action.

      This is an automated message from CDRA. Please do not reply to this email.
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Allocation email sent to ${toEmail}`)
  } catch (error) {
    console.error('Error sending allocation email:', error)
    // Don't throw to avoid breaking allocation flow; log for observability
  }
}

// Send support/help request to a fixed recipient
export async function sendSupportEmail(params: {
  fromName?: string
  fromEmail?: string
  role?: string
  userId?: string
  message: string
}): Promise<void> {
  const { fromName, fromEmail, role, userId, message } = params

  const recipient = "Emmanuelolachealii@gmail.com"

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || 'CDRA'}" <${process.env.MAIL_FROM_EMAIL || 'no-reply@cdra.local'}>`,
    to: recipient,
    subject: `CDRA Support Request${fromName ? ` - ${fromName}` : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 24px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">New Support Request</h2>
            <p style="color:#495057"><strong>Name:</strong> ${fromName || 'N/A'}</p>
            <p style="color:#495057"><strong>Email:</strong> ${fromEmail || 'N/A'}</p>
            <p style="color:#495057"><strong>Role:</strong> ${role || 'N/A'}</p>
            <p style="color:#495057"><strong>User ID:</strong> ${userId || 'N/A'}</p>
            <p style="color:#495057"><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; color:#333; border:1px solid #e9ecef; background:#fff; border-radius:8px; padding:12px;">${message}</div>
          </div>
        </body>
      </html>
    `,
    text: `New Support Request\n\nName: ${fromName || 'N/A'}\nEmail: ${fromEmail || 'N/A'}\nRole: ${role || 'N/A'}\nUser ID: ${userId || 'N/A'}\n\nMessage:\n${message}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Support email sent to ${recipient}`)
  } catch (error) {
    console.error('Error sending support email:', error)
    throw new Error('Failed to send support email')
  }
}