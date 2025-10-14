import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });