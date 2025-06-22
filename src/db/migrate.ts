import { db } from '../db/connection';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { users } from '../db/schema';
import { config } from 'dotenv';

// config();


async function runMigrations() {
  const migrationsFolder = path.join(__dirname, 'migrations');
  await migrate(db, { migrationsFolder });
  console.log('Миграции успешно применены');

  const allUsers = await db.select().from(users);
  console.log('Миграции успешно применены2' + allUsers);
  
  process.exit(0);
}

runMigrations().catch((e) => {
  console.error('Ошибка миграций:', e);
  process.exit(1);
});