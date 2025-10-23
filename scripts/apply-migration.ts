import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Read .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const databaseUrl = envContent
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL='))
  ?.split('=')[1]
  ?.trim();

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env file');
}

const client = postgres(databaseUrl, { ssl: 'require' });
const db = drizzle(client);

async function applyMigration() {
  try {
    console.log('Applying migration: add use_internal_scheduling column...');
    
    await db.execute(sql`
      ALTER TABLE agent_profiles 
      ADD COLUMN IF NOT EXISTS use_internal_scheduling boolean DEFAULT false NOT NULL;
    `);
    
    console.log('✓ Migration applied successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    await client.end();
    process.exit(1);
  }
}

applyMigration();
