import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createPool } from '../db/index.ts';

const usePostgres = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_HOST);
let sqliteInstance: Database.Database | null = null;

function getSqliteDb(): Database.Database {
  if (!sqliteInstance) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'app.db');
    sqliteInstance = new Database(dbPath);
    sqliteInstance.pragma('journal_mode = WAL');
  }
  return sqliteInstance;
}

export async function ensureAuthSchema() {
  if (usePostgres) {
    try {
      const pool = createPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          email_verified INTEGER NOT NULL DEFAULT 0,
          verification_token TEXT,
          verification_token_expiry BIGINT,
          reset_token TEXT,
          reset_token_expiry BIGINT,
          last_login_at TEXT,
          login_attempts INTEGER NOT NULL DEFAULT 0,
          lock_until BIGINT,
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

        CREATE TABLE IF NOT EXISTS broadcasts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          target TEXT DEFAULT 'all',
          created_at TEXT NOT NULL,
          author_id TEXT
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

      try { await pool.query(`ALTER TABLE user_purchases ADD COLUMN expires_at TEXT;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE user_purchases ADD COLUMN tariff_type TEXT DEFAULT 'monthly';`); } catch (e) {}
      try { await pool.query(`ALTER TABLE users ADD COLUMN is_partner INTEGER DEFAULT 0;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE users ADD COLUMN referred_by TEXT;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE users ADD COLUMN bonus_balance REAL DEFAULT 0;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE registered_users ADD COLUMN purchased_courses_count INTEGER DEFAULT 0;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE registered_users ADD COLUMN is_partner INTEGER DEFAULT 0;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE orders ADD COLUMN promo_code TEXT;`); } catch (e) {}
      try { await pool.query(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'sbp';`); } catch (e) {}
      return;
    } catch (err) {
      console.warn('[DB] PostgreSQL init failed, fallback to SQLite:', (err as any)?.message);
    }
  }

  // SQLite Schema Initialization
  const sdb = getSqliteDb();
  sdb.exec(`
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
      auth_date INTEGER,
      user_id TEXT,
      created_at INTEGER NOT NULL,
      confirmed_at INTEGER
    );

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

    CREATE TABLE IF NOT EXISTS broadcasts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      target TEXT DEFAULT 'all',
      created_at TEXT NOT NULL,
      author_id TEXT
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

  try { sdb.exec("ALTER TABLE user_purchases ADD COLUMN expires_at TEXT;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE user_purchases ADD COLUMN tariff_type TEXT DEFAULT 'monthly';"); } catch (e) {}
  try { sdb.exec("ALTER TABLE users ADD COLUMN is_partner INTEGER DEFAULT 0;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE users ADD COLUMN referral_code TEXT;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE users ADD COLUMN referred_by TEXT;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE users ADD COLUMN bonus_balance REAL DEFAULT 0;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE registered_users ADD COLUMN purchased_courses_count INTEGER DEFAULT 0;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE registered_users ADD COLUMN is_partner INTEGER DEFAULT 0;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE orders ADD COLUMN promo_code TEXT;"); } catch (e) {}
  try { sdb.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'sbp';"); } catch (e) {}
}

export const authDatabase = {
  exec: async (sql: string) => {
    if (usePostgres) {
      try {
        const pool = createPool();
        await pool.query(sql);
        return;
      } catch (err) {
        console.warn('[DB Exec] Postgres failed, using SQLite:', (err as any)?.message);
      }
    }
    getSqliteDb().exec(sql);
  },
  prepare: (sql: string) => {
    const sqliteSql = sql;
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
        if (usePostgres) {
          try {
            const pool = createPool();
            const res = await pool.query(pgSql, cleanParams);
            return res.rows[0];
          } catch (err) {
            console.warn('[DB GET] Postgres error, fallback to SQLite:', (err as any)?.message);
          }
        }
        try {
          const stmt = getSqliteDb().prepare(sqliteSql);
          return stmt.get(...cleanParams);
        } catch (err) {
          console.error('[SQLite GET Error]', err, sqliteSql, cleanParams);
          throw err;
        }
      },
      all: async (...params: any[]) => {
        const cleanParams = sanitizeParams(params);
        if (usePostgres) {
          try {
            const pool = createPool();
            const res = await pool.query(pgSql, cleanParams);
            return res.rows;
          } catch (err) {
            console.warn('[DB ALL] Postgres error, fallback to SQLite:', (err as any)?.message);
          }
        }
        try {
          const stmt = getSqliteDb().prepare(sqliteSql);
          return stmt.all(...cleanParams);
        } catch (err) {
          console.error('[SQLite ALL Error]', err, sqliteSql, cleanParams);
          throw err;
        }
      },
      run: async (...params: any[]) => {
        const cleanParams = sanitizeParams(params);
        if (usePostgres) {
          try {
            const pool = createPool();
            const res = await pool.query(pgSql, cleanParams);
            return { lastInsertRowid: null, changes: res.rowCount };
          } catch (err) {
            console.warn('[DB RUN] Postgres error, fallback to SQLite:', (err as any)?.message);
          }
        }
        try {
          const stmt = getSqliteDb().prepare(sqliteSql);
          const res = stmt.run(...cleanParams);
          return { lastInsertRowid: res.lastInsertRowid, changes: res.changes };
        } catch (err) {
          console.error('[SQLite RUN Error]', err, sqliteSql, cleanParams);
          throw err;
        }
      },
    };
  },
};
