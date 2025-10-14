# 🌐 CORS Proxy & Worker Setup Guide

Complete guide for setting up CORS proxy and worker infrastructure for Otazumi.

## 📋 Table of Contents

- [Why Do We Need Proxies?](#why-do-we-need-proxies)
- [CORS Proxy Setup (Cloudflare Workers)](#cors-proxy-setup)
- [M3U8 Proxy Setup](#m3u8-proxy-setup)
- [Worker URLs Configuration](#worker-urls-configuration)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Why Do We Need Proxies?

### CORS (Cross-Origin Resource Sharing) Issues

When your frontend (running on `otazumi.netlify.app`) tries to fetch data from external anime APIs, browsers block these requests due to CORS policy. This is a security feature.

**The Problem:**
```
Access to fetch at 'https://external-api.com/anime' from origin 'https://otazumi.netlify.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**The Solution:**
Use a proxy server that:
1. Receives requests from your frontend
2. Fetches data from the external API
3. Adds proper CORS headers
4. Returns the data to your frontend

---

## CORS Proxy Setup

### Option 1: Cloudflare Workers (Recommended)

Cloudflare Workers provide a free, fast, and reliable proxy solution.

#### Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Verify your email

#### Step 2: Create a Worker

1. Go to **Workers & Pages** in your dashboard
2. Click **Create Application** → **Create Worker**
3. Name your worker (e.g., `otazumi-cors-proxy`)
4. Click **Deploy**

#### Step 3: Edit Worker Code

Click **Quick Edit** and replace the code with:

```javascript
// Otazumi CORS Proxy
// Handles CORS headers for external API requests

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get the URL from query parameter
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  // Check if URL is provided
  if (!targetUrl) {
    return new Response('Missing URL parameter', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  // Handle OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    })
  }
  
  try {
    // Fetch the target URL
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' ? await request.text() : undefined
    })
    
    // Clone response and add CORS headers
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return newResponse
  } catch (error) {
    return new Response(`Proxy error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
```

#### Step 4: Save and Deploy

1. Click **Save and Deploy**
2. Copy your worker URL (e.g., `https://otazumi-cors-proxy.your-subdomain.workers.dev`)

#### Step 5: Configure Environment Variable

In your `.env` file:

```env
VITE_PROXY_URL=https://otazumi-cors-proxy.your-subdomain.workers.dev/?url=
```

**Note**: The `?url=` at the end is important!

### Option 2: Custom Proxy Server

If you prefer hosting your own proxy:

```javascript
// server.js (Node.js/Express)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }
  
  try {
    const response = await axios.get(targetUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});
```

Deploy to:
- Vercel
- Railway
- Render
- Heroku

---

## M3U8 Proxy Setup

M3U8 streams need special handling for HLS video playback.

### Using Existing M3U8 Proxy

Deploy the [m3u8proxy](https://github.com/itzzzme/m3u8proxy) project:

#### Step 1: Fork the Repository

1. Go to [github.com/itzzzme/m3u8proxy](https://github.com/itzzzme/m3u8proxy)
2. Click **Fork**

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your forked repository
4. Click **Deploy**

#### Step 3: Configure Environment Variable

```env
VITE_M3U8_PROXY_URL=https://your-m3u8-proxy.vercel.app/m3u8-proxy?url=
```

### Custom M3U8 Proxy (Node.js)

```javascript
// m3u8-proxy.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/m3u8-proxy', async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }
  
  try {
    const response = await axios.get(targetUrl, {
      responseType: 'text'
    });
    
    // Modify M3U8 content to use proxy for segments
    let m3u8Content = response.data;
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    
    // Replace relative URLs with proxied URLs
    m3u8Content = m3u8Content.replace(
      /(.*\.ts)/g, 
      `${req.protocol}://${req.get('host')}/m3u8-proxy?url=${baseUrl}$1`
    );
    
    res.header('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(m3u8Content);
  } catch (error) {
    res.status(500).send(`Proxy error: ${error.message}`);
  }
});

app.listen(3001, () => {
  console.log('M3U8 proxy running on port 3001');
});
```

---

## Worker URLs Configuration

Worker URLs are optional and used for specific anime sources that require additional processing.

### Setup Multiple Workers

If you need multiple workers for load balancing:

1. Create multiple Cloudflare Workers (e.g., `worker-1`, `worker-2`, `worker-3`)
2. Deploy the same proxy code to each
3. Configure in `.env`:

```env
VITE_WORKER_URL=https://worker-1.workers.dev,https://worker-2.workers.dev,https://worker-3.workers.dev
```

### When to Use Worker URLs

Use worker URLs when:
- You need load balancing across multiple proxy servers
- Specific anime sources require special handling
- You want redundancy (fallback to another worker if one fails)

### Skipping Worker URLs

If you don't need workers, you can skip this and modify the code in `src/utils/getQtip.utils.js` to directly fetch without workers (follow the pattern in other utils files).

---

## Testing Your Setup

### Test CORS Proxy

```bash
# Test with curl
curl "https://your-cors-proxy.workers.dev/?url=https://api.example.com/test"

# Should return data with CORS headers
```

### Test M3U8 Proxy

```bash
# Test M3U8 playlist
curl "https://your-m3u8-proxy.vercel.app/m3u8-proxy?url=https://example.com/video.m3u8"

# Should return modified M3U8 content
```

### Test in Browser

```javascript
// Open browser console on your site
fetch('https://your-cors-proxy.workers.dev/?url=https://api.example.com/test')
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

### Test Video Playback

1. Open Otazumi
2. Try playing any anime episode
3. Check browser console for errors
4. If video plays, proxies are working!

---

## Troubleshooting

### Common Issues

#### 1. "Proxy error: Failed to fetch"

**Cause**: Target URL is invalid or unreachable

**Solution**:
- Verify the target URL is correct
- Check if the API is online
- Test the URL directly in browser

#### 2. "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause**: CORS headers not properly set

**Solution**:
- Check your proxy code has CORS headers
- Verify the proxy URL is correctly configured
- Make sure you're using the proxy URL, not the direct API

#### 3. "Mixed Content" Error

**Cause**: Trying to load HTTP content from HTTPS site

**Solution**:
- Ensure all proxy URLs use HTTPS
- Check that APIs support HTTPS
- Use HTTPS for all external resources

#### 4. Video not playing / M3U8 errors

**Cause**: M3U8 proxy not working or misconfigured

**Solution**:
- Test M3U8 proxy directly
- Check M3U8 URL structure
- Verify proxy is modifying segment URLs correctly
- Try different video server

#### 5. Worker quota exceeded

**Cause**: Cloudflare Workers free tier limits reached

**Solution**:
- Create multiple workers for load balancing
- Upgrade to Cloudflare Workers paid plan
- Implement caching to reduce requests
- Use different proxy service

### Debugging Tips

**1. Check Browser Console**
```javascript
// See all network requests
// Look for failed requests (red)
// Check request headers
```

**2. Test Proxy Directly**
```bash
# Test proxy is responding
curl -I https://your-proxy.workers.dev

# Test with actual URL
curl "https://your-proxy.workers.dev/?url=https://api.example.com/test"
```

**3. Verify Environment Variables**
```bash
# In your project
echo $VITE_PROXY_URL
echo $VITE_M3U8_PROXY_URL

# Make sure they end with ?url= or appropriate parameter
```

**4. Check Cloudflare Dashboard**
- Go to Workers & Pages
- Click your worker
- Check Analytics tab for errors
- View Logs in Real-time for debugging

---

## Best Practices

### Security

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Whitelist Origins**: Only allow requests from your domain
3. **Validate URLs**: Check target URLs against a whitelist
4. **Monitor Usage**: Track proxy usage and set up alerts

### Performance

1. **Caching**: Cache responses when possible
2. **CDN**: Use Cloudflare's CDN for faster delivery
3. **Multiple Workers**: Load balance across workers
4. **Compression**: Enable gzip/brotli compression

### Monitoring

1. **Cloudflare Analytics**: Monitor worker performance
2. **Error Tracking**: Log errors to external service
3. **Uptime Monitoring**: Use services like UptimeRobot
4. **Alert Setup**: Get notified of downtime

---

## Alternative Solutions

### 1. Backend Proxy

Instead of client-side proxies, route requests through your backend:

```javascript
// Your backend API
app.get('/api/anime/:id', async (req, res) => {
  const animeId = req.params.id;
  const response = await fetch(`https://anime-api.com/anime/${animeId}`);
  const data = await response.json();
  res.json(data);
});
```

**Pros**: More control, better security
**Cons**: More infrastructure to manage

### 2. Browser Extension (Development Only)

For local development, use a CORS browser extension:
- "Allow CORS: Access-Control-Allow-Origin" (Chrome)
- "CORS Everywhere" (Firefox)

**⚠️ Never use this in production!**

### 3. Paid Proxy Services

Consider paid proxy services for production:
- ScraperAPI
- Bright Data
- Oxylabs

**Pros**: Reliable, handles complexity
**Cons**: Monthly costs

---

## Environment Variables Summary

After setup, your `.env` should have:

```env
# CORS Proxy (Required)
VITE_PROXY_URL=https://your-cors-proxy.workers.dev/?url=

# M3U8 Proxy (Highly Recommended)
VITE_M3U8_PROXY_URL=https://your-m3u8-proxy.vercel.app/m3u8-proxy?url=

# Workers (Optional)
VITE_WORKER_URL=https://worker1.workers.dev,https://worker2.workers.dev

# Iframe Servers (Optional)
VITE_BASE_IFRAME_URL=https://megaplay.buzz/stream/s-2
VITE_BASE_IFRAME_URL_2=https://vidwish.live/stream/s-2
```

---

## Need Help?

- 📖 **Cloudflare Workers Docs**: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)
- 💬 **GitHub Discussions**: [github.com/nishal21/otazumi/discussions](https://github.com/nishal21/otazumi/discussions)
- 📧 **Email Support**: support@otazumi.com
- 🐛 **Report Issues**: [github.com/nishal21/otazumi/issues](https://github.com/nishal21/otazumi/issues)

---

<div align="center">

**Made with ❤️ by the Otazumi Team**

[Back to Documentation](README.md) • [FAQ](FAQ.md) • [Email Setup](EMAIL_SYSTEM.md)

</div>
