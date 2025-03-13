import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

// Use DATABASE_URL for the connection string
const sql = neon(process.env.DATABASE_URL);

// Drizzle initialization
export const db = drizzle(sql);  