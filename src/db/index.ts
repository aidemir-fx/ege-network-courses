import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const isPostgresConfigured = (): boolean => {
  if (process.env.DATABASE_URL) return true;
  if (process.env.POSTGRES_HOST && process.env.POSTGRES_PASSWORD) return true;
  return false;
};

export const createPool = (): Pool | null => {
  if (!isPostgresConfigured()) {
    return null;
  }

  if (!global._postgresPool) {
    if (process.env.DATABASE_URL) {
      global._postgresPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 3000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.POSTGRES_HOST || process.env.SQL_HOST,
        user: process.env.POSTGRES_USER || process.env.SQL_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || process.env.SQL_PASSWORD,
        database: process.env.POSTGRES_DB || process.env.SQL_DB_NAME || 'postgres',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        max: 10,
        connectionTimeoutMillis: 3000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.warn('[Postgres Pool Warning]', err?.message);
    });
  }

  return global._postgresPool;
};

export const getDb = () => {
  const pool = createPool();
  return pool ? drizzle(pool, { schema }) : null;
};
