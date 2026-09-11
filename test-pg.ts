import { authDatabase } from './src/server/db-shim.ts';

async function run() {
  try {
    const res = await authDatabase.prepare(`
      SELECT * FROM user_purchases
      WHERE (user_id = ? OR (user_telegram_id IS NOT NULL AND user_telegram_id = ?))
        AND status = 'active'
      ORDER BY granted_at DESC NULLS LAST, id DESC
    `).all('usr-123', '123');
    console.log("Purchases:", res);
  } catch (e) {
    console.error("Purchases Error:", e);
  }
}

run();
