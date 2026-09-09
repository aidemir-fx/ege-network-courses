import { createPool } from '../db/index.ts';

export const authDatabase = {
  exec: async (sql: string) => {
    const pool = createPool();
    await pool.query(sql);
  },
  prepare: (sql: string) => {
    let pgSql = sql;
    let counter = 1;
    // convert ? to $1, $2, etc
    pgSql = pgSql.replace(/\?/g, () => '$' + (counter++));
    
    // Some SQLite specific syntax fixes for postgres:
    pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
    pgSql = pgSql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    pgSql = pgSql.replace(/COLLATE NOCASE/g, ''); // Postgres uses ILIKE or CITEXT, but we can just drop it for simple schemas.
    pgSql = pgSql.replace(/INSERT OR REPLACE INTO/g, 'INSERT INTO'); // naive fallback, might need conflict clauses if actually used

    return {
      get: async (...params: any[]) => {
        const pool = createPool();
        const res = await pool.query(pgSql, params);
        return res.rows[0];
      },
      all: async (...params: any[]) => {
        const pool = createPool();
        const res = await pool.query(pgSql, params);
        return res.rows;
      },
      run: async (...params: any[]) => {
        const pool = createPool();
        const res = await pool.query(pgSql, params);
        return { lastInsertRowid: null, changes: res.rowCount };
      }
    };
  }
};
