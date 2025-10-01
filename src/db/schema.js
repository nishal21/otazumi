import { pgTable, serial, text, timestamp, boolean, json, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  avatarId: text('avatar').default('1'), // Changed from avatar to avatarId for clarity, maps to 'avatar' column
  preferences: json('preferences').default({
    language: 'EN',
    autoPlay: false,
    autoNext: false,
    autoSkipIntro: false,
    theme: 'dark'
  }),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  animeId: text('anime_id').notNull(),
  episodeId: text('episode_id').notNull(),
  episodeNumber: integer('episode_number').notNull(),
  watchedAt: timestamp('watched_at').defaultNow(),
  progress: integer('progress').default(0), // in seconds
  completed: boolean('completed').default(false)
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  animeId: text('anime_id').notNull(),
  title: text('title').notNull(),
  poster: text('poster'),
  addedAt: timestamp('added_at').defaultNow()
});

export const watchlist = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  animeId: text('anime_id').notNull(),
  title: text('title').notNull(),
  poster: text('poster'),
  status: text('status').default('plan_to_watch'), // plan_to_watch, watching, completed, on_hold, dropped
  addedAt: timestamp('added_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow()
});