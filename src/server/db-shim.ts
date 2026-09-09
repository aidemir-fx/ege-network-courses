import { createPool } from '../db/index.ts';

export async function ensureAuthSchema() {
  const pool = createPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      verification_token_expiry INTEGER,
      reset_token TEXT,
      reset_token_expiry INTEGER,
      last_login_at TEXT,
      login_attempts INTEGER NOT NULL DEFAULT 0,
      lock_until INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      is_partner INTEGER DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      bonus_balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS telegram_auth_sessions (
      session_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      tg_id TEXT,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      photo_url TEXT,
      auth_date BIGINT,
      user_id TEXT,
      created_at BIGINT NOT NULL,
      confirmed_at BIGINT
    );

    ALTER TABLE telegram_auth_sessions
      ALTER COLUMN auth_date TYPE BIGINT USING auth_date::BIGINT,
      ALTER COLUMN created_at TYPE BIGINT USING created_at::BIGINT,
      ALTER COLUMN confirmed_at TYPE BIGINT USING confirmed_at::BIGINT;

    CREATE TABLE IF NOT EXISTS registered_users (
      id TEXT PRIMARY KEY,
      telegram_id TEXT,
      email TEXT,
      name TEXT,
      username TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      registered_at TEXT,
      last_login TEXT,
      purchased_courses_count INTEGER DEFAULT 0,
      is_partner INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_telegram_id TEXT,
      user_name TEXT,
      customer_email TEXT,
      items_json TEXT,
      total_amount REAL,
      discount_amount REAL DEFAULT 0,
      promo_code TEXT,
      payment_method TEXT DEFAULT 'sbp',
      payment_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      paid_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS user_purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_telegram_id TEXT,
      order_id TEXT,
      course_id TEXT,
      course_title TEXT,
      subject TEXT,
      school TEXT,
      year TEXT,
      price REAL,
      granted_at TEXT,
      granted_by TEXT DEFAULT 'system',
      status TEXT DEFAULT 'active',
      expires_at TEXT,
      tariff_type TEXT DEFAULT 'monthly'
    );

    CREATE TABLE IF NOT EXISTS promocodes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      discount_percent INTEGER DEFAULT 15,
      max_uses INTEGER DEFAULT 500,
      used_count INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      action TEXT,
      details TEXT,
      admin_telegram_id TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      user_telegram_id TEXT,
      user_name TEXT,
      sender TEXT,
      text TEXT,
      created_at TEXT,
      is_read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS referral_rewards (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      referred_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

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
