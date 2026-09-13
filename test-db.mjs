import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  port: 5432
});

async function test() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables:", res.rows.map(r => r.table_name));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
test();
