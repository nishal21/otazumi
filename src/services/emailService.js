
export class EmailService {
  static provider = import.meta.env.VITE_EMAIL_PROVIDER || 'console'; // 'backend', 'brevo', 'resend', 'sendgrid', or 'console'
  static fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@otazumi.anime';
  static fromName = import.meta.env.VITE_FROM_NAME || 'Otazumi Anime';
  static appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  static emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';

  /**
   * Send email using configured provider
   */
  static async sendEmail({ to, subject, html, text }) {
    try {
      console.log(`📧 Sending email to: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`🔧 Provider: ${this.provider}`);

      switch (this.provider) {
        case 'backend':
          return await this.sendWithBackend({ to, subject, html, text });
        
        case 'brevo':
          return await this.sendWithBrevo({ to, subject, html, text });
        
        case 'resend':
          return await this.sendWithResend({ to, subject, html, text });
        
        case 'sendgrid':
          return await this.sendWithSendGrid({ to, subject, html, text });
        
        case 'console':
        default:
          // Development mode - log to console
          console.log('📧 EMAIL PREVIEW (Development Mode)');
          console.log('═══════════════════════════════════');
          console.log(`To: ${to}`);
          console.log(`Subject: ${subject}`);
          console.log('───────────────────────────────────');
          console.log(text || 'No text version provided');
          console.log('═══════════════════════════════════');
          return { success: true, message: 'Email logged to console (development mode)' };
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send email using Backend SMTP Server (RECOMMENDED)
   * Uses your own Node.js SMTP server with Gmail/Custom SMTP
   * Setup: See email-server/README.md
   */
  static async sendWithBackend({ to, subject, html, text }) {
    if (!this.emailServerUrl) {
      throw new Error('VITE_EMAIL_SERVER_URL not configured in .env');
    }

    try {
      const response = await fetch(`${this.emailServerUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text: text || this.stripHtml(html),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email via backend');
      }

      console.log('✅ Email sent successfully via backend SMTP:', data.messageId);
      return { success: true, messageId: data.messageId, provider: 'backend' };
    } catch (error) {
      console.error('❌ Backend SMTP error:', error);
      throw error;
    }
  }

  
  static async sendWithBrevo({ to, subject, html, text }) {
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_BREVO_API_KEY not configured in .env');
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.fromName,
            email: this.fromEmail
          },
          to: [{ email: to, name: to.split('@')[0] }],
          subject,
          htmlContent: html,
          textContent: text || this.stripHtml(html),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Brevo');
      }

      console.log('✅ Email sent successfully via Brevo:', data.messageId);
      return { success: true, messageId: data.messageId, provider: 'brevo' };
    } catch (error) {
      console.error('❌ Brevo error:', error);
      throw error;
    }
  }

  /**
   * Send email using Resend API
   * Sign up: https://resend.com
   */
  static async sendWithResend({ to, subject, html, text }) {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_RESEND_API_KEY not configured in .env');
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [to],
          subject,
          html,
          text: text || this.stripHtml(html),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Resend');
      }

      console.log('✅ Email sent successfully via Resend:', data.id);
      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }
  }

  /**
   * Send email using SendGrid API
   * Sign up: https://sendgrid.com
   */
  static async sendWithSendGrid({ to, subject, html, text }) {
    const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_SENDGRID_API_KEY not configured in .env');
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject,
          content: [
            {
              type: 'text/html',
              value: html,
            },
            {
              type: 'text/plain',
              value: text || this.stripHtml(html),
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to send email via SendGrid');
      }

      console.log('✅ Email sent successfully via SendGrid');
      return { success: true, provider: 'sendgrid' };
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetTemplate(userName, resetUrl);
    const text = `
Hello ${userName},

You recently requested to reset your password for your Otazumi account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Thanks,
The Otazumi 
    `.trim();

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Otazumi Password',
      html,
      text,
    });
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email, userName) {
    const html = this.getWelcomeTemplate(userName);
    const text = `
Welcome to Otazumi, ${userName}!

Thank you for joining Otazumi, your ultimate anime streaming platform!

Here's what you can do:
✓ Browse thousands of anime series and movies
✓ Create your personalized watchlist
✓ Track your favorite anime
✓ Sync your data across devices

Start exploring: ${this.appUrl}

Happy watching!
The Otazumi 
    `.trim();

    return await this.sendEmail({
      to: email,
      subject: '🎉 Welcome to Otazumi!',
      html,
      text,
    });
  }

  /**
   * Send email verification
   */
  static async sendVerificationEmail(email, verificationToken, userName) {
    const verifyUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;
    
    const html = this.getVerificationTemplate(userName, verifyUrl);
    const text = `
Hello ${userName},

Please verify your email address to complete your Otazumi registration.

Click the link below to verify your email:
${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Thanks,
The Otazumi 
    `.trim();

    return await this.sendEmail({
      to: email,
      subject: 'Verify Your Otazumi Email',
      html,
      text,
    });
  }

  /**
   * Send notification about account changes
   */
  static async sendAccountChangeNotification(email, userName, changeType) {
    const html = this.getAccountChangeTemplate(userName, changeType);
    const text = `
Hello ${userName},

This is to notify you that your ${changeType} was recently changed.

If you made this change, you can safely ignore this email.

If you did not make this change, please contact support immediately at support@otazumi.com

Thanks,
The Otazumi 
    `.trim();

    return await this.sendEmail({
      to: email,
      subject: `Otazumi Account ${changeType} Changed`,
      html,
      text,
    });
  }

  // ============================================
  // HTML Email Templates
  // ============================================

  static getPasswordResetTemplate(userName, resetUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f10; color: #e4e4e7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f10;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
              <img src="https://i.ibb.co/4wv0783N/Untitled-design.png" alt="Otazumi Logo" style="width: 80px; height: 80px; margin-bottom: 15px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                You recently requested to reset your password for your Otazumi account. Click the button below to reset it:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; padding: 12px; background-color: #27272a; border-radius: 6px; font-size: 12px; color: #71717a; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="margin: 30px 0; padding: 16px; background-color: #3f1d1d; border-left: 4px solid #ef4444; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #fca5a5;">
                  <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #27272a; text-align: center; border-top: 1px solid #3f3f46;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #a1a1aa;">
                Thanks,<br><strong style="color: #e4e4e7;">The Otazumi </strong>
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #71717a;">
                © ${new Date().getFullYear()} Otazumi. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  static getWelcomeTemplate(userName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Otazumi</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f10; color: #e4e4e7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f10;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
              <img src="https://i.ibb.co/4wv0783N/Untitled-design.png" alt="Otazumi Logo" style="width: 100px; height: 100px; margin-bottom: 15px;">
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Welcome to Otazumi!</h1>
              <p style="margin: 0; color: #ddd6fe; font-size: 16px;">Your anime adventure begins now</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Thank you for joining <strong>Otazumi</strong>, your ultimate anime streaming platform! We're excited to have you here.
              </p>
              
              <!-- Features -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 8px; margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 16px; color: #e4e4e7;">
                      <span style="font-size: 24px; margin-right: 10px;">🎬</span>
                      <strong>Thousands of Anime</strong><br>
                      <span style="font-size: 14px; color: #a1a1aa;">Browse and watch your favorite series and movies</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 16px; color: #e4e4e7;">
                      <span style="font-size: 24px; margin-right: 10px;">�</span>
                      <strong>Subtitle Downloads</strong><br>
                      <span style="font-size: 14px; color: #a1a1aa;">Download subtitles in 8 languages for offline viewing</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 16px; color: #e4e4e7;">
                      <span style="font-size: 24px; margin-right: 10px;">�📋</span>
                      <strong>Personalized Watchlist</strong><br>
                      <span style="font-size: 14px; color: #a1a1aa;">Keep track of what you're watching and plan ahead</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 16px; color: #e4e4e7;">
                      <span style="font-size: 24px; margin-right: 10px;">❤️</span>
                      <strong>Favorites & History</strong><br>
                      <span style="font-size: 14px; color: #a1a1aa;">Save your favorites and track your watch history</span>
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #27272a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 16px; color: #e4e4e7;">
                      <span style="font-size: 24px; margin-right: 10px;">☁️</span>
                      <strong>Cloud Sync</strong><br>
                      <span style="font-size: 14px; color: #a1a1aa;">Access your data from any device, anywhere</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${this.appUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Watching</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                Happy watching! 🍿
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #27272a; text-align: center; border-top: 1px solid #3f3f46;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #a1a1aa;">
                Thanks,<br><strong style="color: #e4e4e7;">The Otazumi </strong>
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #71717a;">
                © ${new Date().getFullYear()} Otazumi. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  static getVerificationTemplate(userName, verifyUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f10; color: #e4e4e7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f10;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 40px 20px; text-align: center;">
              <img src="https://i.ibb.co/4wv0783N/Untitled-design.png" alt="Otazumi Logo" style="width: 80px; height: 80px; margin-bottom: 15px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✉️ Verify Your Email</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Please verify your email address to complete your Otazumi registration and unlock all features.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; padding: 12px; background-color: #27272a; border-radius: 6px; font-size: 12px; color: #71717a; word-break: break-all;">
                ${verifyUrl}
              </p>
              
              <div style="margin: 30px 0; padding: 16px; background-color: #1e3a2e; border-left: 4px solid #10b981; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #86efac;">
                  <strong>⏱️ Note:</strong> This verification link will expire in <strong>24 hours</strong>.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                If you didn't create an account, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #27272a; text-align: center; border-top: 1px solid #3f3f46;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #a1a1aa;">
                Thanks,<br><strong style="color: #e4e4e7;">The Otazumi </strong>
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #71717a;">
                © ${new Date().getFullYear()} Otazumi. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  static getAccountChangeTemplate(userName, changeType) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Change Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f10; color: #e4e4e7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0f0f10;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
              <img src="https://i.ibb.co/4wv0783N/Untitled-design.png" alt="Otazumi Logo" style="width: 80px; height: 80px; margin-bottom: 15px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔔 Account Change Notification</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #e4e4e7;">
                This is to notify you that your <strong>${changeType}</strong> was recently changed on your Otazumi account.
              </p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #3f1d1d; border-left: 4px solid #ef4444; border-radius: 6px;">
                <p style="margin: 0 0 10px; font-size: 16px; color: #fca5a5; font-weight: 600;">
                  ⚠️ Was this you?
                </p>
                <p style="margin: 0; font-size: 14px; color: #fca5a5;">
                  If you made this change, you can safely ignore this email.
                </p>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #27272a; border-radius: 6px;">
                <p style="margin: 0 0 10px; font-size: 16px; color: #e4e4e7; font-weight: 600;">
                  🛡️ Didn't make this change?
                </p>
                <p style="margin: 0 0 15px; font-size: 14px; color: #a1a1aa;">
                  If you did NOT authorize this change, please take action immediately:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #a1a1aa;">
                  <li style="margin-bottom: 8px;">Reset your password immediately</li>
                  <li style="margin-bottom: 8px;">Contact our support team at support@otazumi.com</li>
                  <li>Review your account's recent activity</li>
                </ul>
              </div>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${this.appUrl}/reset-password" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #27272a; text-align: center; border-top: 1px solid #3f3f46;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #a1a1aa;">
                Thanks,<br><strong style="color: #e4e4e7;">The Otazumi </strong>
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #71717a;">
                © ${new Date().getFullYear()} Otazumi. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Strip HTML tags from text (fallback for text version)
   */
  static stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
