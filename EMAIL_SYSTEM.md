# 📧 Email System Documentation

Complete guide to Otazumi's email system for verification, password reset, and notifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Email Providers](#email-providers)
- [Gmail SMTP Setup](#gmail-smtp-setup)
- [Provider Configuration](#provider-configuration)
- [Email Templates](#email-templates)
- [Rate Limits](#rate-limits)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Otazumi uses a **multi-provider email system** with automatic fallback:

1. **Primary**: Gmail SMTP (500 emails/day)
2. **Fallback 1**: Brevo (300 emails/day free)
3. **Fallback 2**: Resend (100 emails/day free)
4. **Fallback 3**: SendGrid (100 emails/day free)
5. **Development**: Console (prints to terminal)

### Email Use Cases

- ✅ **Email Verification**: Confirm user email on registration
- 🔑 **Password Reset**: Send secure reset links
- 📊 **Profile Export**: Send user data export files
- 🔔 **Notifications**: System announcements (future)

---

## Email Providers

### Provider Comparison

| Provider | Free Tier | Setup Difficulty | Reliability | Speed |
|----------|-----------|------------------|-------------|-------|
| Gmail SMTP | 500/day | Medium | ⭐⭐⭐⭐⭐ | Fast |
| Brevo | 300/day | Easy | ⭐⭐⭐⭐ | Fast |
| Resend | 100/day | Easy | ⭐⭐⭐⭐⭐ | Very Fast |
| SendGrid | 100/day | Medium | ⭐⭐⭐⭐ | Fast |

### Recommended Setup

**For Small Projects** (< 100 users):
- Gmail SMTP only

**For Medium Projects** (100-1000 users):
- Gmail SMTP + Brevo

**For Large Projects** (> 1000 users):
- All providers configured for maximum reliability

---

## Gmail SMTP Setup

### Prerequisites

- Gmail account
- 2-Factor Authentication enabled

### Step 1: Enable 2-Factor Authentication

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security**
3. Enable **2-Step Verification**
4. Follow the setup wizard

### Step 2: Generate App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in if prompted
3. Select **Mail** as the app
4. Select **Other (Custom name)** as device
5. Enter name: `Otazumi Email Service`
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

In your `.env` file:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # App password (without spaces)
EMAIL_FROM=your-email@gmail.com
```

### Important Notes

- ⚠️ **Remove spaces** from app password
- ✅ Use port **587** (TLS) or **465** (SSL)
- 🔒 Never commit `.env` to Git
- 📧 Limit: **500 emails/day**

---

## Provider Configuration

### Brevo (Sendinblue)

**Free Tier**: 300 emails/day

#### Setup

1. Go to [brevo.com](https://www.brevo.com)
2. Sign up for free account
3. Verify your email
4. Go to **SMTP & API** → **API Keys**
5. Click **Generate a new API key**
6. Copy the API key

#### Configuration

```env
# Brevo API
BREVO_API_KEY=xkeysib-your-api-key-here
```

#### Code Integration

Already integrated in `backend/config/email.js`:

```javascript
case 'brevo':
  return {
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: 'your-brevo-email@example.com',
      pass: process.env.BREVO_API_KEY
    }
  };
```

---

### Resend

**Free Tier**: 100 emails/day

#### Setup

1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub or email
3. Verify your email
4. Go to **API Keys**
5. Click **Create API Key**
6. Name it `Otazumi Production`
7. Copy the API key (starts with `re_`)

#### Configuration

```env
# Resend API
RESEND_API_KEY=re_your_api_key_here
```

#### Code Integration

```javascript
case 'resend':
  // Uses Resend API, not SMTP
  // Implemented in backend/utils/email.js
  const resend = require('resend');
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: html
  });
```

---

### SendGrid

**Free Tier**: 100 emails/day

#### Setup

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Complete verification
4. Go to **Settings** → **API Keys**
5. Click **Create API Key**
6. Choose **Full Access**
7. Name it `Otazumi Email`
8. Copy the API key (starts with `SG.`)

#### Configuration

```env
# SendGrid API
SENDGRID_API_KEY=SG.your-api-key-here
```

#### Code Integration

```javascript
case 'sendgrid':
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: html
  });
```

---

## Email Templates

### Verification Email

**Purpose**: Confirm user email address

**Template**: `backend/templates/verification-email.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline styles for email compatibility */
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
    .button { background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Welcome to Otazumi!</h1>
    <p>Thank you for signing up. Please verify your email address to activate your account.</p>
    <a href="{{verificationLink}}" class="button">Verify Email</a>
    <p>Or copy this link: {{verificationLink}}</p>
    <p>This link expires in 24 hours.</p>
  </div>
</body>
</html>
```

**Variables**:
- `{{verificationLink}}`: Verification URL with token

---

### Password Reset Email

**Purpose**: Send secure password reset link

**Template**: `backend/templates/password-reset-email.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
    .button { background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔑 Password Reset Request</h1>
    <p>You requested to reset your password for Otazumi.</p>
    <a href="{{resetLink}}" class="button">Reset Password</a>
    <p>Or copy this link: {{resetLink}}</p>
    <div class="warning">
      <strong>⚠️ Security Notice:</strong>
      <ul>
        <li>This link expires in 1 hour</li>
        <li>If you didn't request this, ignore this email</li>
        <li>Never share this link with anyone</li>
      </ul>
    </div>
  </div>
</body>
</html>
```

**Variables**:
- `{{resetLink}}`: Password reset URL with token

---

### Data Export Email

**Purpose**: Send user profile data export

**Template**: `backend/templates/data-export-email.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Your Otazumi Data Export</h1>
    <p>Hello {{username}},</p>
    <p>Your profile data export is ready. Please find the attachment below.</p>
    <p><strong>Export includes:</strong></p>
    <ul>
      <li>Profile information</li>
      <li>Favorites list</li>
      <li>Watchlist</li>
      <li>Watch history</li>
    </ul>
    <p>This data is in JSON format and can be imported to restore your profile.</p>
  </div>
</body>
</html>
```

**Variables**:
- `{{username}}`: User's display name

**Attachment**: JSON file with user data

---

## Rate Limits

### Daily Email Limits

To prevent spam and stay within provider limits:

```javascript
// backend/services/authService.js
const EMAIL_LIMITS = {
  verification: {
    maxPerDay: 300,        // 300 registrations per day
    maxPerUser: 3,         // 3 verification emails per user
    cooldown: 300000       // 5 minutes between resends
  },
  passwordReset: {
    maxPerDay: 100,        // 100 reset requests per day
    maxPerUser: 5,         // 5 reset emails per user per day
    cooldown: 300000       // 5 minutes between requests
  },
  export: {
    maxPerUser: 10,        // 10 exports per user per day
    cooldown: 3600000      // 1 hour between exports
  }
};
```

### Implementation

```javascript
// Check if rate limit exceeded
async function checkEmailRateLimit(email, type) {
  const key = `email_limit:${type}:${email}`;
  const count = await redis.get(key) || 0;
  
  if (count >= EMAIL_LIMITS[type].maxPerUser) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  await redis.setex(key, 86400, count + 1); // Expires in 24 hours
}
```

### Frontend Rate Limiting

```javascript
// src/services/authService.js
const REGISTRATION_LIMIT = 300; // Daily limit

export const checkRegistrationLimit = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('registrationLimit');
  
  if (!stored) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 0
    }));
    return true;
  }
  
  const limit = JSON.parse(stored);
  
  // Reset count if new day
  if (limit.date !== today) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 0
    }));
    return true;
  }
  
  // Check if limit reached
  return limit.count < REGISTRATION_LIMIT;
};
```

---

## Testing

### Test Email Sending

```javascript
// backend/test-email.js
const emailService = require('./services/emailService');

async function testEmail() {
  try {
    await emailService.sendVerificationEmail(
      'test@example.com',
      'TestUser',
      'test-token-123'
    );
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();
```

Run:
```bash
node backend/test-email.js
```

### Test All Providers

```javascript
// Test each provider
const providers = ['gmail', 'brevo', 'resend', 'sendgrid'];

for (const provider of providers) {
  console.log(`\nTesting ${provider}...`);
  process.env.EMAIL_PROVIDER = provider;
  
  try {
    await emailService.sendVerificationEmail(
      'test@example.com',
      'TestUser',
      'test-token'
    );
    console.log(`✅ ${provider} works!`);
  } catch (error) {
    console.log(`❌ ${provider} failed: ${error.message}`);
  }
}
```

### Check Email Delivery

1. **Gmail**: Check Sent folder
2. **Brevo**: Dashboard → Statistics
3. **Resend**: Dashboard → Logs
4. **SendGrid**: Activity Feed

---

## Troubleshooting

### Common Issues

#### 1. "Authentication failed"

**Cause**: Wrong credentials or app password

**Solution**:
- Verify SMTP_USER and SMTP_PASS in `.env`
- Regenerate Gmail app password
- Check for spaces in app password
- Ensure 2FA is enabled for Gmail

#### 2. "Connection timeout"

**Cause**: Wrong port or firewall blocking

**Solution**:
- Try port 587 (TLS) or 465 (SSL)
- Check firewall settings
- Verify SMTP_HOST is correct
- Test connection: `telnet smtp.gmail.com 587`

#### 3. "Rate limit exceeded"

**Cause**: Too many emails sent

**Solution**:
- Wait 24 hours for limit reset
- Configure additional providers
- Implement better rate limiting
- Upgrade to paid plan

#### 4. "Email not received"

**Cause**: Spam folder, wrong email, or delivery failure

**Solution**:
- Check spam/junk folder
- Verify email address is correct
- Check provider dashboard for delivery status
- Test with different email address
- Add sender to contacts

#### 5. "SSL/TLS error"

**Cause**: SSL certificate or encryption issue

**Solution**:
```javascript
// Add to email config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  }
});
```

#### 6. "Template not found"

**Cause**: Email template file missing or path wrong

**Solution**:
- Check `backend/templates/` directory exists
- Verify template file names
- Check file paths in email service
- Use absolute paths if needed

### Debugging

**Enable Debug Logging**:

```javascript
// backend/config/email.js
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,  // Enable debug
  logger: true  // Log to console
});
```

**Test SMTP Connection**:

```javascript
// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('✅ SMTP ready to send emails');
  }
});
```

---

## Best Practices

### Security

1. **Never hardcode credentials** - Use environment variables
2. **Use app passwords** - Never use your actual Gmail password
3. **Implement rate limiting** - Prevent abuse
4. **Validate email addresses** - Check format before sending
5. **Use HTTPS** - For verification/reset links
6. **Token expiration** - Expire tokens after 24 hours (verification) or 1 hour (reset)

### Performance

1. **Queue emails** - Use a queue system for large volumes
2. **Async sending** - Don't block requests waiting for email
3. **Multiple providers** - Automatic fallback for reliability
4. **Caching** - Cache templates to avoid file reads

### Deliverability

1. **SPF Records** - Add to DNS if using custom domain
2. **DKIM** - Enable for better deliverability
3. **Avoid spam triggers** - Don't use all caps, excessive punctuation
4. **Include unsubscribe** - For newsletters
5. **Test thoroughly** - Send to multiple email providers

### Monitoring

1. **Track delivery** - Log successful/failed sends
2. **Monitor rates** - Check daily email counts
3. **Set up alerts** - Get notified of failures
4. **Review spam reports** - Check if emails marked as spam

---

## Environment Variables Summary

Complete email configuration:

```env
# Email Provider Selection
EMAIL_PROVIDER=gmail  # Options: gmail, brevo, resend, sendgrid, console

# Gmail SMTP (Primary)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-without-spaces
EMAIL_FROM=your-email@gmail.com

# Brevo (Fallback 1)
BREVO_API_KEY=xkeysib-your-api-key

# Resend (Fallback 2)
RESEND_API_KEY=re_your_api_key

# SendGrid (Fallback 3)
SENDGRID_API_KEY=SG.your-api-key

# App Configuration
FRONTEND_URL=https://otazumi.netlify.app
```

---

## Advanced Configuration

### Custom Email Templates

Create custom templates:

```javascript
// backend/utils/emailTemplates.js
const fs = require('fs');
const path = require('path');

function getTemplate(name, variables) {
  const templatePath = path.join(__dirname, '../templates', `${name}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  
  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return html;
}

module.exports = { getTemplate };
```

### Email Queue System

For high-volume applications:

```javascript
// backend/queue/emailQueue.js
const Queue = require('bull');
const emailService = require('../services/emailService');

const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process emails
emailQueue.process(async (job) => {
  const { type, email, data } = job.data;
  
  switch (type) {
    case 'verification':
      await emailService.sendVerificationEmail(email, data.username, data.token);
      break;
    case 'password-reset':
      await emailService.sendPasswordResetEmail(email, data.token);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
});

// Add email to queue
async function queueEmail(type, email, data) {
  await emailQueue.add({ type, email, data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

module.exports = { queueEmail };
```

---

## Need Help?

- 📖 **Nodemailer Docs**: [nodemailer.com](https://nodemailer.com)
- 📖 **Gmail SMTP**: [support.google.com/mail](https://support.google.com/mail)
- 💬 **GitHub Discussions**: [github.com/nishal21/otazumi/discussions](https://github.com/nishal21/otazumi/discussions)
- 🐛 **Report Issues**: [github.com/nishal21/otazumi/issues](https://github.com/nishal21/otazumi/issues)

---

<div align="center">

**Made with ❤️ by the Otazumi Team**

[Back to Documentation](README.md) • [FAQ](FAQ.md) • [Proxy Setup](PROXY_SETUP.md)

</div>
