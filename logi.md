app-1  |   throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be configured in production");
app-1  |   ^
app-1  | 
app-1  | Error: JWT_SECRET and JWT_REFRESH_SECRET must be configured in production
app-1  |     at Object.<anonymous> (/app/dist/server.cjs:491:9)
app-1  |     at Module._compile (node:internal/modules/cjs/loader:1781:14)
app-1  |     at Object..js (node:internal/modules/cjs/loader:1913:10)
app-1  |     at Module.load (node:internal/modules/cjs/loader:1505:32)
app-1  |     at Function._load (node:internal/modules/cjs/loader:1309:12)
app-1  |     at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
app-1  |     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
app-1  |     at node:internal/main/run_main_module:36:49
app-1  | 
app-1  | Node.js v22.23.2
^C
root@server-dpwl:~/ege-network-courses# nano .env
root@server-dpwl:~/ege-network-courses# git pull
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 3 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 413 bytes | 59.00 KiB/s, done.
From https://github.com/aidemir-fx/ege-network-courses
   022e2b6..4cb4a6a  main       -> origin/main
Updating 022e2b6..4cb4a6a
Fast-forward
 docker-compose.yml | 18 ++++--------------
 1 file changed, 4 insertions(+), 14 deletions(-)
root@server-dpwl:~/ege-network-courses# docker compose up -d
WARN[0000] /root/ege-network-courses/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
[+] up 2/2
 ✔ Container ege-network-courses-db-1  Healthy                              6.9s
 ✔ Container ege-network-courses-app-1 Started                              6.6s
root@server-dpwl:~/ege-network-courses# Connection to 104.253.175.148 closed by remote host.
Connection to 104.253.175.148 closed.
a123@123s-MacBook-Air ~ % clear                   

a123@123s-MacBook-Air ~ % ssh root@104.253.175.148
root@104.253.175.148's password: 
Welcome to Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-35-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro
Last login: Sat Sep 12 17:21:49 2026 from 185.23.66.102
root@server-dpwl:~# docker compose logs -f app
no configuration file provided: not found
root@server-dpwl:~# cd ege-network-courses
root@server-dpwl:~/ege-network-courses# docker compose logs -f app
WARN[0000] /root/ege-network-courses/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
app-1  | 
app-1  | > react-example@0.0.0 start
app-1  | > node dist/server.cjs
app-1  | 
app-1  | ◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
app-1  | [TelegramBot] Background poller started for seamless deep-link auth
app-1  | ◇ injected env (0) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
app-1  | ◇ injected env (0) from .env.example // tip: ⌘ custom filepath { path: '/custom/path/.env' }
app-1  | [Auth] Registering auth routes at /api/auth
app-1  | [Auth] authRoutes type: function
app-1  | Server running on http://0.0.0.0:3000
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [TelegramAuth] Session tg_c3c80505a8fc26237af171e1 confirmed by @market_hedge
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "users" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] Error syncing user: Error: CRITICAL: PostgreSQL connection failed: relation "users" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.get (/app/dist/server.cjs:437:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:1635:26
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "user_purchases" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [GetPurchases] Error: Error: CRITICAL: PostgreSQL connection failed: relation "user_purchases" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1996:18)
app-1  |     at async /app/dist/server.cjs:2142:23
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "user_purchases" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [GetPurchases] Error: Error: CRITICAL: PostgreSQL connection failed: relation "user_purchases" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1996:18)
app-1  |     at async /app/dist/server.cjs:2142:23
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "users" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] Error fetching users list: Error: CRITICAL: PostgreSQL connection failed: relation "users" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:1726:24
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "system_logs" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "orders" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Orders] Error fetching orders: Error: CRITICAL: PostgreSQL connection failed: relation "orders" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2045:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "promocodes" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Promocodes] Error fetching list: Error: CRITICAL: PostgreSQL connection failed: relation "promocodes" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2237:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "users" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] Error fetching users list: Error: CRITICAL: PostgreSQL connection failed: relation "users" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:1726:24
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "orders" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Orders] Error fetching orders: Error: CRITICAL: PostgreSQL connection failed: relation "orders" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2045:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "promocodes" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Promocodes] Error fetching list: Error: CRITICAL: PostgreSQL connection failed: relation "promocodes" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2237:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "system_logs" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "orders" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Orders] Error fetching orders: Error: CRITICAL: PostgreSQL connection failed: relation "orders" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2045:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "promocodes" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Promocodes] Error fetching list: Error: CRITICAL: PostgreSQL connection failed: relation "promocodes" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:2237:18
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "system_logs" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "users" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] Error fetching users list: Error: CRITICAL: PostgreSQL connection failed: relation "users" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:1726:24
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "user_purchases" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [GetPurchases] Error: Error: CRITICAL: PostgreSQL connection failed: relation "user_purchases" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1996:18)
app-1  |     at async /app/dist/server.cjs:2142:23
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "users" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [Admin Auth] Error syncing user: Error: CRITICAL: PostgreSQL connection failed: relation "users" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.get (/app/dist/server.cjs:437:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async /app/dist/server.cjs:1635:26
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "user_purchases" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [GetPurchases] Error: Error: CRITICAL: PostgreSQL connection failed: relation "user_purchases" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1996:18)
app-1  |     at async /app/dist/server.cjs:2142:23
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "user_purchases" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | [GetPurchases] Error: Error: CRITICAL: PostgreSQL connection failed: relation "user_purchases" does not exist
app-1  |     at handlePostgresError (/app/dist/server.cjs:215:9)
app-1  |     at Object.all (/app/dist/server.cjs:449:11)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1996:18)
app-1  |     at async /app/dist/server.cjs:2142:23
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
app-1  | =====================================================
app-1  | [CRITICAL FATAL ERROR] PostgreSQL connection failed!
app-1  | Message: relation "site_settings" does not exist
app-1  | The application requires PostgreSQL for payments, referrals, and sessions.
app-1  | Please check your DATABASE_URL or POSTGRES_PASSWORD in the environment variables.
app-1  | =====================================================
