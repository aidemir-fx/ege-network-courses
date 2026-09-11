import { createPool } from './src/db/index.ts';
async function run() {
  const pool = createPool();
  const r1 = await pool.query('SELECT COUNT(*) FROM users');
  const r2 = await pool.query('SELECT COUNT(*) FROM registered_users');
  console.log('users:', r1.rows[0], 'registered_users:', r2.rows[0]);
  process.exit(0);
}
run();
