import { db } from '../db/connection';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { config } from 'dotenv';

// config();


async function runMigrations() {
  const migrationsFolder = path.join(__dirname, 'migrations');
  await migrate(db, { migrationsFolder });
  console.log('Миграции успешно применены');
  process.exit(0);
}

runMigrations().catch((e) => {
  console.error('Ошибка миграций:', e);
  process.exit(1);
});