// Example backend API for real-time viewer tracking
// This can be implemented in your backend server (Express.js, etc.)

const express = require('express');
const app = express();

// In-memory storage for active sessions (in production, use Redis or database)
let activeViewers = new Set();
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Middleware to track active viewers
app.use((req, res, next) => {
  // Create a unique session ID (in production, use proper session management)
  const sessionId = req.headers['x-session-id'] ||
                   req.cookies?.sessionId ||
                   Math.random().toString(36).substring(2);

  // Add/update session
  activeViewers.add(sessionId);

  // Set session cookie
  res.cookie('sessionId', sessionId, { maxAge: SESSION_TIMEOUT });

  // Clean up expired sessions periodically
  if (Math.random() < 0.1) { // 10% chance to clean up
    // In production, implement proper cleanup with timestamps
    // For now, we'll keep sessions until server restart
  }

  next();
});

// API endpoint for viewer count
app.get('/api/viewers', (req, res) => {
  res.json({
    count: activeViewers.size,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Clean up expired sessions (call this periodically)
function cleanupExpiredSessions() {
  // In a real implementation, you'd track timestamps for each session
  // and remove expired ones. For this example, we'll keep them active.
}

// Start cleanup interval
setInterval(cleanupExpiredSessions, 60000); // Clean up every minute

module.exports = app;

// To use this in your main server:
// const viewerTracker = require('./viewer-tracker');
// app.use('/api', viewerTracker);

// Or integrate directly into your existing Express app