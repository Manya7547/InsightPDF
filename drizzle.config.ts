import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({path: '.env'})


export default defineConfig({
    driver: 'pg',
    schema: './src/lib/db/schema.ts',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
      }
} ) 


// npx drizzle-kit push:pg