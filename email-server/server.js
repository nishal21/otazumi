import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - Update with your frontend domain
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting - 10 emails per 15 minutes per IP
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many emails sent from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create nodemailer transporter
let transporter;

// Configure transporter based on provider
const setupTransporter = () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';

  console.log('🔧 Setting up email transporter with provider:', provider);

  if (provider === 'gmail') {
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  } else if (provider === 'custom') {
    // Custom SMTP configuration (e.g., Hostinger, Namecheap, etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else if (provider === 'sendgrid') {
    // SendGrid SMTP
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    console.error('❌ Invalid EMAIL_PROVIDER. Use: gmail, custom, or sendgrid');
    process.exit(1);
  }

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP Configuration Error:', error);
      console.error('Please check your EMAIL_PROVIDER and SMTP credentials in .env');
    } else {
      console.log('✅ SMTP Server is ready to send emails');
    }
  });
};

setupTransporter();

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    service: 'Otazumi Email Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'GET /': 'API documentation (this page)',
      'GET /health': 'Health check endpoint',
      'POST /api/send-email': 'Send email endpoint'
    },
    usage: {
      method: 'POST',
      url: '/api/send-email',
      body: {
        to: 'recipient@example.com',
        subject: 'Email subject',
        html: '<h1>HTML content</h1>',
        text: 'Plain text content (optional)'
      }
    },
    provider: process.env.EMAIL_PROVIDER || 'gmail',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Otazumi Email Server',
    timestamp: new Date().toISOString(),
  });
});

// Send email endpoint
app.post('/api/send-email', emailLimiter, async (req, res) => {
  try {
    const { to, subject, html, text, from } = req.body;

    // Validation
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and (html or text)',
      });
    }

    // Email options
    const mailOptions = {
      from: from || `${process.env.FROM_NAME || 'Otazumi'} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: html || text,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    console.log('📧 Sending email to:', to);
    console.log('📋 Subject:', subject);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);

    // Distinguish between different error types
    if (error.code === 'EAUTH') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Check SMTP credentials.',
      });
    } else if (error.code === 'ECONNECTION') {
      return res.status(503).json({
        success: false,
        error: 'Connection to SMTP server failed.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Otazumi Email Server running on port', PORT);
  console.log('📧 Provider:', process.env.EMAIL_PROVIDER || 'gmail');
  console.log('📬 From:', process.env.SMTP_USER);
  console.log('🌐 Allowed origins:', corsOptions.origin);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
