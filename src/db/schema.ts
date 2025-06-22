console.log('Файл schema.ts начал выполняться');
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const users = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 255 }).notNull(),
  nickName: text('nickName', { length: 255 }).notNull(),
  avatar: text('avatar'),
  userId: int('userId'),
  chat: int('chat'),
  currentEnergy: int('currentEnergy'),
  ticket: int('ticket'),
  lastVisit: int('lastVisit'), 
 updateVisit: int('lastVisit').notNull(), 
 winStreak: int('winStreak').notNull(), 
  totalEnergy: int('totalEnergy'),
  createdAt: int('created_at', { mode: 'timestamp_ms' })
  .default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`)
  .notNull(),
});

