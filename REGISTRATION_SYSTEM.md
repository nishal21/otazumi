# 📝 Registration System Documentation

Complete guide to Otazumi's user registration system with daily limits and email verification.

## 📋 Table of Contents

- [Overview](#overview)
- [Registration Flow](#registration-flow)
- [Daily Limit System](#daily-limit-system)
- [Email Verification](#email-verification)
- [Implementation Details](#implementation-details)
- [Frontend Integration](#frontend-integration)
- [Backend API](#backend-api)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

Otazumi's registration system includes:

- ✅ **Email Verification** - Verify email before login
- 🔢 **Daily Limits** - 300 registrations per day (60% of Gmail's 500/day limit)
- 🔒 **Secure Passwords** - bcrypt hashing with salt
- 🚫 **Duplicate Prevention** - Check for existing usernames/emails
- 📧 **Multi-Provider Emails** - Automatic fallback for reliability
- 💾 **Cloud Sync** - Profile synced to NeonDB

### Why Daily Limits?

Gmail SMTP allows **500 emails per day** on free accounts. To prevent hitting this limit and ensure reliable service:

- **300 registrations/day** = 300 verification emails
- **100 password resets/day** = buffer for password resets
- **100 other emails/day** = buffer for exports and notifications

This ensures we never exceed Gmail's limit and maintains reliable email delivery.

---

## Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Registration Flow                        │
└─────────────────────────────────────────────────────────────┘

1. User visits registration page
   ↓
2. Check if daily limit reached (300/day)
   ↓
   ├─ Limit reached → Show error message
   │                  "Registration limit reached. Try again tomorrow."
   │
   └─ Limit not reached → Continue
      ↓
3. User fills form (username, email, password)
   ↓
4. Frontend validation
   ↓
   ├─ Invalid → Show field errors
   │            "Username must be 3-20 characters"
   │
   └─ Valid → Submit to API
      ↓
5. Backend validation
   ↓
   ├─ Username/email exists → Return error
   │                          "Username already taken"
   │
   └─ Valid → Continue
      ↓
6. Hash password (bcrypt)
   ↓
7. Create user in database
   ↓
8. Generate verification token (expires in 24 hours)
   ↓
9. Send verification email
   ↓
10. Increment daily registration count
    ↓
11. Return success response
    ↓
12. User receives verification email
    ↓
13. User clicks verification link
    ↓
14. Verify token and mark email as verified
    ↓
15. Redirect to login
    ↓
16. User logs in with verified account
```

---

## Daily Limit System

### Frontend Tracking

Tracks daily registration count in localStorage:

```javascript
// src/services/authService.js
const REGISTRATION_LIMIT = 300;

export const checkRegistrationLimit = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('registrationLimit');
  
  // Initialize if not exists
  if (!stored) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 0
    }));
    return true; // Allow registration
  }
  
  const limit = JSON.parse(stored);
  
  // Reset count if new day
  if (limit.date !== today) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 0
    }));
    return true; // Allow registration
  }
  
  // Check if limit reached
  if (limit.count >= REGISTRATION_LIMIT) {
    return false; // Block registration
  }
  
  return true; // Allow registration
};

export const incrementRegistrationCount = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('registrationLimit');
  
  if (!stored) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 1
    }));
    return;
  }
  
  const limit = JSON.parse(stored);
  
  // Reset if new day
  if (limit.date !== today) {
    localStorage.setItem('registrationLimit', JSON.stringify({
      date: today,
      count: 1
    }));
    return;
  }
  
  // Increment count
  limit.count += 1;
  localStorage.setItem('registrationLimit', JSON.stringify(limit));
};
```

### Backend Tracking (Optional)

For more reliable tracking, implement server-side limits:

```javascript
// backend/services/rateLimitService.js
const registrationCounts = new Map(); // or use Redis

export function checkDailyRegistrationLimit() {
  const today = new Date().toDateString();
  const count = registrationCounts.get(today) || 0;
  
  if (count >= 300) {
    throw new Error('Daily registration limit reached. Please try again tomorrow.');
  }
  
  return true;
}

export function incrementDailyRegistrationCount() {
  const today = new Date().toDateString();
  const count = registrationCounts.get(today) || 0;
  registrationCounts.set(today, count + 1);
  
  // Clean up old dates
  for (const [date] of registrationCounts) {
    if (date !== today) {
      registrationCounts.delete(date);
    }
  }
}
```

### Redis Implementation (Recommended for Production)

```javascript
// backend/services/rateLimitService.js
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.connect();

export async function checkDailyRegistrationLimit() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `registration_limit:${today}`;
  
  const count = await redis.get(key) || 0;
  
  if (count >= 300) {
    throw new Error('Daily registration limit reached. Please try again tomorrow.');
  }
  
  return true;
}

export async function incrementDailyRegistrationCount() {
  const today = new Date().toISOString().split('T')[0];
  const key = `registration_limit:${today}`;
  
  await redis.incr(key);
  await redis.expire(key, 86400); // Expire after 24 hours
}
```

---

## Email Verification

### Generate Verification Token

```javascript
// backend/services/authService.js
import crypto from 'crypto';
import { db } from '@/config/database';
import { emailVerificationTokens } from '@/schema';

async function generateVerificationToken(userId) {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // Store in database
  await db.insert(emailVerificationTokens).values({
    userId,
    token,
    expiresAt
  });
  
  return token;
}
```

### Send Verification Email

```javascript
// backend/services/emailService.js
import nodemailer from 'nodemailer';
import { getTemplate } from '@/utils/emailTemplates';

export async function sendVerificationEmail(email, username, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = getTemplate('verification-email', {
    username,
    verificationLink
  });
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - Otazumi',
    html
  });
}
```

### Verify Email

```javascript
// backend/routes/auth.js
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/config/database';
import { users, emailVerificationTokens } from '@/schema';

app.post('/api/auth/verify-email', async (req, res) => {
  const { token } = req.body;
  
  try {
    // Find token in database
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1);
    
    if (!tokenRecord) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token' 
      });
    }
    
    // Mark email as verified
    await db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, tokenRecord.userId));
    
    // Delete used token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, tokenRecord.id));
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});
```

---

## Implementation Details

### Registration Component

```jsx
// src/components/auth/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, checkRegistrationLimit, incrementRegistrationCount } from '@/services/authService';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Check daily limit
    if (!checkRegistrationLimit()) {
      setErrors({ 
        general: 'Daily registration limit reached (300/day). Please try again tomorrow.' 
      });
      return;
    }
    
    // Validate form
    const newErrors = {};
    
    if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be 3-20 characters';
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit registration
    setIsLoading(true);
    
    try {
      await register(formData.username, formData.email, formData.password);
      
      // Increment local counter
      incrementRegistrationCount();
      
      // Show success message
      alert('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      setErrors({ 
        general: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Account</h1>
      
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-500">{errors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500"
            required
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <p className="text-center mt-4 text-gray-400">
        Already have an account?{' '}
        <a href="/login" className="text-violet-500 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
```

---

## Frontend Integration

### Auth Service

```javascript
// src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function register(username, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
}

export async function verifyEmail(token) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Verification failed');
  }
  
  return data;
}

export async function resendVerificationEmail(email) {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to resend email');
  }
  
  return data;
}
```

---

## Backend API

### Registration Endpoint

```javascript
// backend/routes/auth.js
import bcrypt from 'bcryptjs';
import { db } from '@/config/database';
import { users } from '@/schema';
import { sendVerificationEmail } from '@/services/emailService';
import { generateVerificationToken } from '@/services/authService';
import { checkDailyRegistrationLimit, incrementDailyRegistrationCount } from '@/services/rateLimitService';

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check daily limit
    checkDailyRegistrationLimit();
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if username exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Check if email exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        avatar: 'avatar1',
        isEmailVerified: false
      })
      .returning();
    
    // Generate verification token
    const token = await generateVerificationToken(newUser.id);
    
    // Send verification email
    await sendVerificationEmail(email, username, token);
    
    // Increment daily count
    incrementDailyRegistrationCount();
    
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: newUser.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('Daily registration limit')) {
      return res.status(429).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});
```

---

## Security

### Password Security

- ✅ **bcrypt hashing** with salt rounds (10)
- ✅ **Minimum length** of 6 characters (recommend 8+)
- ✅ **Never stored plain text**
- ✅ **Secure comparison** using bcrypt.compare()

### Token Security

- ✅ **Cryptographically random** tokens (32 bytes)
- ✅ **Time-limited** expiration (24 hours for verification, 1 hour for reset)
- ✅ **Single use** - deleted after verification
- ✅ **Server-side validation**

### Input Validation

- ✅ **Length checks** (username 3-20, password 6+)
- ✅ **Format validation** (email, username characters)
- ✅ **SQL injection protection** (parameterized queries with Drizzle)
- ✅ **XSS protection** (sanitize inputs)

### Rate Limiting

- ✅ **Daily registration limit** (300/day)
- ✅ **Email cooldown** (5 minutes between resends)
- ✅ **Account lockout** (after 5 failed login attempts)

---

## Troubleshooting

### "Daily registration limit reached"

**Cause**: 300 registrations already completed today

**Solution**:
- Wait until tomorrow (resets at midnight)
- Implement backend limit tracking with Redis for accuracy
- Upgrade email provider for higher limits

### "Email not received"

**Cause**: Email delivery failed or in spam

**Solution**:
- Check spam/junk folder
- Verify SMTP configuration
- Test email sending manually
- Use "Resend verification email" feature
- Check email provider dashboard for delivery status

### "Invalid or expired token"

**Cause**: Verification link expired (>24 hours) or already used

**Solution**:
- Request new verification email
- Check link was copied correctly
- Ensure token hasn't been used already

### "Username already taken"

**Cause**: Another user has this username

**Solution**:
- Choose a different username
- Add numbers or underscores to make it unique

### "Registration failed"

**Cause**: Server error or database issue

**Solution**:
- Check backend logs for details
- Verify database connection
- Check NeonDB is running
- Ensure all environment variables are set

---

## Best Practices

### For Users

1. **Use strong passwords** - At least 8 characters with mix of letters, numbers, symbols
2. **Verify email immediately** - Token expires in 24 hours
3. **Keep credentials secure** - Never share password or tokens
4. **Use unique email** - Don't reuse emails across accounts

### For Developers

1. **Monitor registration trends** - Track daily counts
2. **Implement server-side limits** - Don't rely only on frontend
3. **Use Redis for tracking** - More reliable than localStorage
4. **Log registration attempts** - For security and debugging
5. **Test email delivery** - Verify all providers work
6. **Implement account recovery** - Allow password reset
7. **Add CAPTCHA** - Prevent bot registrations (if needed)

---

## Environment Variables

Required configuration:

```env
# API
VITE_API_URL=https://your-backend.com/api

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL (for verification links)
FRONTEND_URL=https://otazumi.netlify.app

# Redis (optional, for server-side tracking)
REDIS_URL=redis://localhost:6379
```

---

## Future Enhancements

- 🔐 **OAuth Login** - Google, GitHub, Discord
- 📱 **SMS Verification** - Alternative to email
- 🤖 **CAPTCHA** - Prevent bot registrations
- 🔔 **Welcome Email** - Onboarding guide after verification
- 📊 **Analytics** - Track registration sources
- 🎁 **Referral System** - Invite friends for rewards

---

## Need Help?

- 📖 **bcrypt**: [npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs)
- 📖 **Nodemailer**: [nodemailer.com](https://nodemailer.com)
- 💬 **GitHub Discussions**: [github.com/nishal21/otazumi/discussions](https://github.com/nishal21/otazumi/discussions)
- 🐛 **Report Issues**: [github.com/nishal21/otazumi/issues](https://github.com/nishal21/otazumi/issues)

---

<div align="center">

**Made with ❤️ by the Otazumi Team**

[Back to Documentation](README.md) • [FAQ](FAQ.md) • [Profile System](PROFILE_SYSTEM.md)

</div>
