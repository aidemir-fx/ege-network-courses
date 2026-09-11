import { authDatabase } from './src/server/db-shim.ts';

async function run() {
  try {
    const res = await authDatabase.prepare(`
      SELECT id, name, referral_code, referred_by FROM users
    `).all();
    console.log("Users:", res);
  } catch (e) {
    console.error("Users Error:", e);
  }
}

run();
