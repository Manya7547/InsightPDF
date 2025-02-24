import {neon, neonConfig} from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http';
neonConfig.fetchConnectionCache = true;

if(!process.env.DATABASE_URL) {
    throw new Error('database not found');
}

// connect sql server using neon connection
const sql = neon(process.env.DATABASE_env)

// performing sql queries 
export const db = drizzle(sql)

