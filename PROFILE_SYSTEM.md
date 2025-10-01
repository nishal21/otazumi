# 👤 Profile System Documentation

Complete guide to Otazumi's user profile system with cloud sync, avatars, and data management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Database Schema](#database-schema)
- [Avatar System](#avatar-system)
- [Data Synchronization](#data-synchronization)
- [Profile Management](#profile-management)
- [Data Export & Import](#data-export--import)
- [API Reference](#api-reference)

---

## Overview

Otazumi's profile system provides:

- 🎭 **20 Anime Avatars** - Customize your profile
- ☁️ **Cloud Sync** - Access your data anywhere
- 📊 **Data Export** - Download your profile data
- 📥 **Data Import** - Restore from backup
- 🔒 **Privacy Controls** - Manage your data
- 📱 **Cross-Device** - Sync across multiple devices

---

## Features

### User Profile

- **Username**: Unique identifier
- **Email**: For verification and communication
- **Avatar**: Choose from 20 anime characters
- **Account Created**: Registration date
- **Email Verified**: Verification status
- **Last Login**: Track activity

### Favorites System

- **Add to Favorites**: Save your favorite anime
- **Quick Access**: Access favorites from any page
- **Cloud Sync**: Available on all devices
- **Unlimited Storage**: No limit on favorites

### Watchlist

- **Plan to Watch**: Queue anime to watch later
- **Status Tracking**: Mark as watching, completed, on hold
- **Priority**: Set priority levels
- **Cloud Sync**: Available everywhere

### Watch History

- **Automatic Tracking**: Records what you watch
- **Episode Progress**: Continue where you left off
- **Timestamp**: See when you watched
- **Cloud Sync**: Resume on any device

---

## Database Schema

### NeonDB Setup

Otazumi uses **NeonDB** (PostgreSQL) with **Drizzle ORM**.

#### Database Connection

```javascript
// backend/config/database.js
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
```

#### Environment Variable

```env
DATABASE_URL=postgresql://username:password@ep-name.region.aws.neon.tech/dbname?sslmode=require
```

### Schema Definition

```javascript
// backend/schema/index.js
import { pgTable, serial, text, varchar, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  avatar: varchar('avatar', { length: 50 }).default('avatar1'),
  isEmailVerified: boolean('is_email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login')
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
    usernameIdx: uniqueIndex('username_idx').on(table.username)
  };
});

// Favorites Table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  animeId: varchar('anime_id', { length: 50 }).notNull(),
  title: text('title').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    userAnimeIdx: uniqueIndex('user_anime_idx').on(table.userId, table.animeId)
  };
});

// Watchlist Table
export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  animeId: varchar('anime_id', { length: 50 }).notNull(),
  title: text('title').notNull(),
  image: text('image'),
  status: varchar('status', { length: 20 }).default('plan_to_watch'),
  priority: integer('priority').default(0),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    userAnimeWatchIdx: uniqueIndex('user_anime_watch_idx').on(table.userId, table.animeId)
  };
});

// Watch History Table
export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  animeId: varchar('anime_id', { length: 50 }).notNull(),
  episodeId: varchar('episode_id', { length: 50 }).notNull(),
  title: text('title').notNull(),
  episodeNumber: integer('episode_number'),
  image: text('image'),
  watchedAt: timestamp('watched_at').defaultNow(),
  progress: integer('progress').default(0),
  duration: integer('duration')
}, (table) => {
  return {
    userEpisodeIdx: uniqueIndex('user_episode_idx').on(table.userId, table.episodeId)
  };
});

// Email Verification Tokens
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Password Reset Tokens
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
```

### Database Migration

```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# Drop database (careful!)
npm run db:drop
```

---

## Avatar System

### Available Avatars

Otazumi includes **20 anime-style avatars**:

| Avatar ID | Character Style | Gender |
|-----------|----------------|---------|
| avatar1 | Naruto style | Male |
| avatar2 | Sasuke style | Male |
| avatar3 | Sakura style | Female |
| avatar4 | Luffy style | Male |
| avatar5 | Zoro style | Male |
| avatar6 | Nami style | Female |
| avatar7 | Goku style | Male |
| avatar8 | Vegeta style | Male |
| avatar9 | Bulma style | Female |
| avatar10 | Ichigo style | Male |
| avatar11 | Rukia style | Female |
| avatar12 | Eren style | Male |
| avatar13 | Mikasa style | Female |
| avatar14 | Deku style | Male |
| avatar15 | Bakugo style | Male |
| avatar16 | Uraraka style | Female |
| avatar17 | Tanjiro style | Male |
| avatar18 | Nezuko style | Female |
| avatar19 | Saitama style | Male |
| avatar20 | Tatsumaki style | Female |

### Avatar Component

```jsx
// src/components/avatar/AvatarSelector.jsx
import { useState } from 'react';
import { Check } from 'lucide-react';

const avatars = Array.from({ length: 20 }, (_, i) => `avatar${i + 1}`);

export default function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {avatars.map((avatar) => (
        <button
          key={avatar}
          onClick={() => onSelect(avatar)}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
            ${selectedAvatar === avatar 
              ? 'border-violet-500 scale-105 shadow-lg shadow-violet-500/50' 
              : 'border-gray-700 hover:border-gray-600'}`}
        >
          <img
            src={`/avatars/${avatar}.png`}
            alt={avatar}
            className="w-full h-full object-cover"
          />
          {selectedAvatar === avatar && (
            <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
```

### Change Avatar

```javascript
// src/services/profileService.js
export async function changeAvatar(avatar) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/profile/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ avatar })
  });
  
  if (!response.ok) {
    throw new Error('Failed to change avatar');
  }
  
  return response.json();
}
```

---

## Data Synchronization

### How Sync Works

1. **Local First**: Data stored in localStorage for offline access
2. **Cloud Backup**: Synced to NeonDB when online
3. **Merge Strategy**: Server data takes priority on conflicts
4. **Real-time**: Sync on every action (add favorite, watch episode, etc.)

### Sync Flow

```
User Action → Update localStorage → API Call → Update Database → Response → Update UI
                    ↓                                                  ↓
               (Offline Mode)                                   (Online Mode)
                    ↓                                                  ↓
              Queue for sync                                    Sync complete
```

### Implementation

```javascript
// src/utils/syncManager.js
class SyncManager {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.processSyncQueue());
    window.addEventListener('offline', () => this.isOnline = false);
  }
  
  // Add action to sync queue
  queueSync(action, data) {
    this.queue.push({ action, data, timestamp: Date.now() });
    localStorage.setItem('syncQueue', JSON.stringify(this.queue));
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
  
  // Process queued sync actions
  async processSyncQueue() {
    this.isOnline = true;
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    
    for (const item of queue) {
      try {
        await this.syncAction(item);
        this.queue = this.queue.filter(q => q.timestamp !== item.timestamp);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
    
    localStorage.setItem('syncQueue', JSON.stringify(this.queue));
  }
  
  // Sync individual action
  async syncAction(item) {
    const { action, data } = item;
    const token = localStorage.getItem('token');
    
    await fetch(`${API_URL}/sync/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  }
}

export const syncManager = new SyncManager();
```

### Sync Triggers

- ✅ Add/remove favorite
- ✅ Add/remove watchlist item
- ✅ Watch episode (update history)
- ✅ Change avatar
- ✅ Update profile settings
- ✅ On app startup (pull latest data)

---

## Profile Management

### View Profile

```javascript
// Get user profile
export async function getProfile() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
}
```

### Update Profile

```javascript
// Update username
export async function updateUsername(username) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/profile/username`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ username })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update username');
  }
  
  return response.json();
}
```

### Delete Account

```javascript
// Delete account with scope options
export async function deleteAccount(scope = 'both') {
  // scope: 'server', 'local', or 'both'
  
  const token = localStorage.getItem('token');
  
  if (scope === 'server' || scope === 'both') {
    await fetch(`${API_URL}/profile`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  if (scope === 'local' || scope === 'both') {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('watchlist');
    localStorage.removeItem('watchHistory');
    localStorage.removeItem('syncQueue');
    localStorage.removeItem('registrationLimit');
  }
  
  // Redirect to home
  window.location.href = '/';
}
```

---

## Data Export & Import

### Export Profile Data

```javascript
// Export user data
export async function exportData() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/profile/export`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export data');
  }
  
  const data = await response.json();
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `otazumi-profile-${Date.now()}.json`;
  a.click();
  
  return data;
}
```

### Data Export Format

```json
{
  "exportDate": "2024-01-15T10:30:00.000Z",
  "profile": {
    "username": "animelover123",
    "email": "user@example.com",
    "avatar": "avatar5",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isEmailVerified": true
  },
  "favorites": [
    {
      "animeId": "naruto-shippuden",
      "title": "Naruto: Shippuden",
      "image": "https://...",
      "addedAt": "2024-01-02T10:00:00.000Z"
    }
  ],
  "watchlist": [
    {
      "animeId": "one-piece",
      "title": "One Piece",
      "image": "https://...",
      "status": "watching",
      "priority": 1,
      "addedAt": "2024-01-03T10:00:00.000Z"
    }
  ],
  "watchHistory": [
    {
      "animeId": "demon-slayer",
      "episodeId": "demon-slayer-episode-1",
      "title": "Demon Slayer",
      "episodeNumber": 1,
      "watchedAt": "2024-01-05T15:30:00.000Z",
      "progress": 1200,
      "duration": 1440
    }
  ],
  "stats": {
    "totalFavorites": 15,
    "totalWatchlist": 8,
    "totalWatched": 247,
    "accountAge": "14 days"
  }
}
```

### Import Profile Data

```javascript
// Import user data
export async function importData(file) {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('data', file);
  
  const response = await fetch(`${API_URL}/profile/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to import data');
  }
  
  return response.json();
}
```

### Import Component

```jsx
// src/components/profile/ImportData.jsx
import { Upload } from 'lucide-react';
import { importData } from '@/services/profileService';

export default function ImportData() {
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await importData(file);
      alert('Data imported successfully!');
      window.location.reload();
    } catch (error) {
      alert('Import failed: ' + error.message);
    }
  };
  
  return (
    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-violet-600 rounded-lg hover:bg-violet-700">
      <Upload className="w-4 h-4" />
      <span>Import Data</span>
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </label>
  );
}
```

---

## API Reference

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/verify-email      - Verify email
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
POST   /api/auth/logout            - Logout user
```

### Profile Endpoints

```
GET    /api/profile                - Get user profile
PUT    /api/profile/username       - Update username
PUT    /api/profile/avatar         - Change avatar
DELETE /api/profile                - Delete account
GET    /api/profile/export         - Export profile data
POST   /api/profile/import         - Import profile data
```

### Favorites Endpoints

```
GET    /api/favorites              - Get user favorites
POST   /api/favorites              - Add to favorites
DELETE /api/favorites/:animeId     - Remove from favorites
```

### Watchlist Endpoints

```
GET    /api/watchlist              - Get user watchlist
POST   /api/watchlist              - Add to watchlist
PUT    /api/watchlist/:animeId     - Update watchlist item
DELETE /api/watchlist/:animeId     - Remove from watchlist
```

### Watch History Endpoints

```
GET    /api/history                - Get watch history
POST   /api/history                - Add to history
PUT    /api/history/:episodeId     - Update progress
DELETE /api/history/:episodeId     - Remove from history
DELETE /api/history                - Clear all history
```

---

## Need Help?

- 📖 **Drizzle ORM**: [orm.drizzle.team](https://orm.drizzle.team)
- 📖 **NeonDB**: [neon.tech/docs](https://neon.tech/docs)
- 💬 **GitHub Discussions**: [github.com/nishal21/otazumi/discussions](https://github.com/nishal21/otazumi/discussions)
- 🐛 **Report Issues**: [github.com/nishal21/otazumi/issues](https://github.com/nishal21/otazumi/issues)

---

<div align="center">

**Made with ❤️ by the Otazumi Team**

[Back to Documentation](README.md) • [FAQ](FAQ.md) • [Email System](EMAIL_SYSTEM.md)

</div>
