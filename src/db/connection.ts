import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';


// 1. Подключение к SQLite
const sqlite = new Database('sqlite.db'); // Файл БД в корне проекта

// 2. Инициализация Drizzle ORM
export const db = drizzle(sqlite);

// 4. Экспорт типа для TypeScript
export type DatabaseType = typeof db;

