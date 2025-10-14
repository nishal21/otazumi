-- Migration to fix column names in existing users table
-- Run this ONLY if you have an existing users table with wrong column names

-- Option 1: If you have no important data, DROP and recreate
DROP TABLE IF EXISTS watch_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run: npm run db:push

-- Option 2: If you have existing data and want to keep it
-- This renames columns to match the new schema

-- Uncomment the lines below if you want to migrate existing data:
/*
-- First, check if columns exist
DO $$ 
BEGIN
  -- Rename avatarId to avatar if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='avatarId'
  ) THEN
    ALTER TABLE users RENAME COLUMN "avatarId" TO avatar;
  END IF;

  -- Ensure is_verified exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='is_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  -- Ensure created_at exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at timestamp DEFAULT now();
  END IF;

  -- Ensure updated_at exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamp DEFAULT now();
  END IF;

  -- Ensure preferences exists with proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN preferences json DEFAULT '{"language":"EN","autoPlay":false,"autoNext":false,"autoSkipIntro":false,"theme":"dark"}'::json;
  END IF;
END $$;
*/
