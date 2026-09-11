import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 3000 }
      : {
          host: process.env.POSTGRES_HOST || process.env.SQL_HOST,
          user: process.env.POSTGRES_USER || process.env.SQL_USER,
          password: process.env.POSTGRES_PASSWORD || process.env.SQL_PASSWORD,
          database: process.env.POSTGRES_DB || process.env.SQL_DB_NAME,
          port: Number(process.env.POSTGRES_PORT) || 5432,
          max: 10,
          connectionTimeoutMillis: 3000,
        };

    global._postgresPool = new Pool(config);

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
