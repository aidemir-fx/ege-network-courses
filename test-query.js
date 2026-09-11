import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres' });
pool.query('SELECT 1').then(console.log).catch(console.error);
