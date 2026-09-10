import { authDatabase } from './src/server/db-shim.ts';

const insertUser = authDatabase.prepare(`
  INSERT INTO users (
    id, email, name, password_hash, email_verified, verification_token,
    verification_token_expiry, login_attempts, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

async function test() {
  try {
    const res = await insertUser.run(
      'usr-1234', 'test4@test.com', 'Test User', 'hash', 1, null, null, 0, 'active', new Date().toISOString()
    );
    console.log(res);
  } catch (e) {
    console.error("ERROR", e);
  }
}
test();
