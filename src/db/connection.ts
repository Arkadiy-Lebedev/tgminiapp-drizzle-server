import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

console.log('Подключение.');
// 1. Подключение к SQLite
const sqlite = new Database('sqlite.db'); // Файл БД в корне проекта
console.log('Подключение к SQLite...' + sqlite);
// 2. Инициализация Drizzle ORM
export const db = drizzle(sqlite);
console.log('Подключение к дризли...' + db);
// 4. Экспорт типа для TypeScript
export type DatabaseType = typeof db;

