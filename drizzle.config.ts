import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite', // ⬅️ Вот это ключевое изменение!
  dbCredentials: {
    url: "sqlite.db" // Путь к файлу БД
  },
  // tablesFilter: ['!libsql_wasm_func_table'],
  // verbose: true,
  // strict: true,
} satisfies Config;