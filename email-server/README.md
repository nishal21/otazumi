# Otazumi Email Server

A lightweight Node.js SMTP email server for Otazumi that can be deployed anywhere.

## Features

- ✅ **Gmail Support** - Use your Gmail account with App Password
- ✅ **Custom SMTP** - Works with any hosting provider (Hostinger, Namecheap, etc.)
- ✅ **SendGrid Support** - Use SendGrid SMTP for reliable delivery
- ✅ **Rate Limiting** - 10 emails per 15 minutes per IP
- ✅ **CORS Protection** - Only your frontend can access
- ✅ **Security** - Helmet.js for HTTP headers
- ✅ **Easy Deployment** - Deploy to Vercel, Railway, Render, or any Node.js host

## Quick Start

### 1. Install Dependencies

```bash
cd email-server
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your SMTP credentials
nano .env
```

### 3. Gmail Setup (Easiest Option)

**Step 1:** Enable 2-Factor Authentication
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification

**Step 2:** Generate App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and your device
- Copy the 16-character password (format: xxxx-xxxx-xxxx-xxxx)

**Step 3:** Update .env
```env
EMAIL_PROVIDER=gmail
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
FROM_NAME=Otazumi Anime
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on http://localhost:3001

### 5. Test Email

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test sending email
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Otazumi!</h1>",
    "text": "Hello from Otazumi!"
  }'
```

## Configuration Options

### Option 1: Gmail (Recommended for Testing)

```env
EMAIL_PROVIDER=gmail
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Pros:**
- ✅ Free (500 emails/day)
- ✅ Easy setup
- ✅ Reliable delivery

**Cons:**
- ❌ Gmail branding
- ❌ Requires App Password

### Option 2: Custom SMTP (Recommended for Production)

```env
EMAIL_PROVIDER=custom
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-password
```

**Pros:**
- ✅ Your own domain
- ✅ Professional
- ✅ Full control

**Cons:**
- ❌ Requires email hosting

### Option 3: SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SMTP_USER=verified-sender@yourdomain.com
```

**Pros:**
- ✅ Reliable
- ✅ Analytics
- ✅ 100 emails/day free

**Cons:**
- ❌ Requires signup

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd email-server
   vercel
   ```

4. **Add Environment Variables**
   - Go to your project in Vercel dashboard
   - Settings → Environment Variables
   - Add all variables from .env

5. **Update Frontend .env**
   ```env
   VITE_EMAIL_SERVER_URL=https://your-email-server.vercel.app
   ```

### Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   cd email-server
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set EMAIL_PROVIDER=gmail
   railway variables set SMTP_USER=your-email@gmail.com
   railway variables set SMTP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   # ... add all other variables
   ```

### Deploy to Render

1. **Create New Web Service** on https://render.com

2. **Connect Repository** or upload folder

3. **Configure**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables** in Render dashboard

5. **Deploy** and get your URL

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
cd email-server
heroku create otazumi-email-server

# Add environment variables
heroku config:set EMAIL_PROVIDER=gmail
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

## Update Frontend to Use Email Server

Update your frontend's `src/services/emailService.js`:

```javascript
// Add this method to EmailService class
static async sendWithBackend({ to, subject, html, text }) {
  const emailServerUrl = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${emailServerUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html, text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    console.log('✅ Email sent via backend server:', data.messageId);
    return { success: true, messageId: data.messageId, provider: 'backend' };
  } catch (error) {
    console.error('❌ Backend email error:', error);
    throw error;
  }
}
```

Update the `sendEmail` method to use backend:

```javascript
static async sendEmail({ to, subject, html, text }) {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'backend';
  
  if (provider === 'backend') {
    return await this.sendWithBackend({ to, subject, html, text });
  }
  // ... rest of the code
}
```

Add to your frontend `.env`:

```env
VITE_EMAIL_PROVIDER=backend
VITE_EMAIL_SERVER_URL=http://localhost:3001
```

For production:
```env
VITE_EMAIL_PROVIDER=backend
VITE_EMAIL_SERVER_URL=https://your-email-server.vercel.app
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "Otazumi Email Server",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

### POST /api/send-email

Send an email.

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Hello",
  "html": "<h1>Hello World</h1>",
  "text": "Hello World"
}
```

**Response (Success):**
```json
{
  "success": true,
  "messageId": "<unique-id@gmail.com>",
  "message": "Email sent successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Features

- **Rate Limiting**: 10 emails per 15 minutes per IP
- **CORS**: Only allowed origins can access
- **Helmet**: Security headers enabled
- **Input Validation**: Required fields checked
- **Error Handling**: Graceful error responses

## Troubleshooting

### Gmail Authentication Error

**Error:** `Authentication failed`

**Solution:**
1. Make sure 2FA is enabled
2. Generate a new App Password
3. Use the 16-character password (remove spaces)
4. Don't use your regular Gmail password

### Connection Error

**Error:** `Connection to SMTP server failed`

**Solution:**
1. Check SMTP_HOST and SMTP_PORT
2. Verify firewall isn't blocking port
3. Test SMTP settings with your email client first

### CORS Error

**Error:** `CORS policy blocked`

**Solution:**
1. Add your frontend URL to ALLOWED_ORIGINS in .env
2. Make sure frontend and backend are running
3. Check browser console for exact error

### Rate Limit Error

**Error:** `Too many emails sent`

**Solution:**
- Wait 15 minutes before sending more
- Increase limit in server.js if needed (line 28)

## Monitoring

View server logs:

```bash
# Development
npm run dev

# Production (with PM2)
pm2 logs otazumi-email
```

## Performance

- **Cold Start**: ~500ms
- **Email Send**: 1-3 seconds
- **Concurrent**: Handles multiple requests
- **Rate Limit**: 10 emails/15min per IP

## Cost

- **Vercel**: Free tier available
- **Railway**: $5/month (500 hours free)
- **Render**: Free tier available
- **Heroku**: $7/month (free tier removed)

## Support

For issues, check:
1. Server logs
2. SMTP credentials
3. Firewall settings
4. Email provider limits

## License

MIT
