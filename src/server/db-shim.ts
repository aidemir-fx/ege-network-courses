import path from 'path';
import fs from 'fs';
import { createPool, isPostgresConfigured } from '../db/index.ts';

let postgresDisabled = false;

const shouldTryPostgres = () => {
  return !postgresDisabled && isPostgresConfigured();
};

const handlePostgresError = (err: any) => {
  console.error('=====================================================');
  console.error('[CRITICAL FATAL ERROR] PostgreSQL connection failed!');
  console.error('Message:', err?.message || err);
  console.error('The application requires PostgreSQL for payments, referrals, and sessions.');
  console.error('Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.');
  console.error('=====================================================');
  
  // Throw error to prevent silent failures in production
  throw new Error(`CRITICAL: PostgreSQL connection failed: ${err?.message || err}`);
};


export { isPostgresConfigured };

export const authDatabase = {
  exec: async (sql: string) => {
    try {
      const pool = createPool();
      if (!pool) throw new Error("PostgreSQL pool is not initialized. Please configure DATABASE_URL.");
      await pool.query(sql);
    } catch (err) {
      handlePostgresError(err);
    }
  },
  prepare: (sql: string) => {
    let pgSql = sql;
    let counter = 1;
    pgSql = pgSql.replace(/\?/g, () => '$' + (counter++));
    pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
    pgSql = pgSql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    pgSql = pgSql.replace(/COLLATE NOCASE/g, '');

    const sanitizeParams = (params: any[]) => {
      return params.map((p) => (p === undefined ? null : p));
    };

    return {
      get: async (...params: any[]) => {
        const cleanParams = sanitizeParams(params);
        try {
      const pool = createPool();
          if (!pool) throw new Error("PostgreSQL pool is not initialized.");
          const res = await pool.query(pgSql, cleanParams);
          return res.rows[0];
        } catch (err) {
          handlePostgresError(err);
          throw err;
        }
      },
      all: async (...params: any[]) => {
        const cleanParams = sanitizeParams(params);
        try {
      const pool = createPool();
          if (!pool) throw new Error("PostgreSQL pool is not initialized.");
          const res = await pool.query(pgSql, cleanParams);
          return res.rows;
        } catch (err) {
          handlePostgresError(err);
          throw err;
        }
      },
      run: async (...params: any[]) => {
        const cleanParams = sanitizeParams(params);
        try {
      const pool = createPool();
          if (!pool) throw new Error("PostgreSQL pool is not initialized.");
          const res = await pool.query(pgSql, cleanParams);
          return { lastInsertRowid: null, changes: res.rowCount };
        } catch (err) {
          handlePostgresError(err);
          throw err;
        }
      },
    };
  },
};
