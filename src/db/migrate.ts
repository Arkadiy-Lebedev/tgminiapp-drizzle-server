import { db } from '../db/connection';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { config } from 'dotenv';

// config();


async function runMigrations() {
  await migrate(db, {
    migrationsFolder: 'src/db/migrations'
  });
  console.log('Migrations completed!');
}

runMigrations().catch(console.error);