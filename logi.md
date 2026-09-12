 > react-example@0.0.0 start
app-1  | > node dist/server.cjs
app-1  | 
app-1  | ◇ injected env (0) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
app-1  | [TelegramBot] Background poller started for seamless deep-link auth
app-1  | ◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
app-1  | ◇ injected env (0) from .env.example // tip: ◈ secrets for agents [www.dotenvx.com]
app-1  | [Auth] Registering auth routes at /api/auth
app-1  | [Auth] authRoutes type: function
app-1  | Server running on http://0.0.0.0:3000
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] User synced: Zero Hedge (TG: 7948060541, Email: undefined, Role: admin)
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [DB GET Error] error: relation "users" does not exist
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'ERROR',
app-1  |   code: '42P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: '15',
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'parse_relation.c',
app-1  |   line: '1392',
app-1  |   routine: 'parserOpenTable'
app-1  | } SELECT * FROM users WHERE id = $1 [ 'usr-105288498' ]
app-1  | [Admin Auth] Error syncing user: error: relation "users" does not exist
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'ERROR',
app-1  |   code: '42P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: '15',
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'parse_relation.c',
app-1  |   line: '1392',
app-1  |   routine: 'parserOpenTable'
app-1  | }
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [DB GET Error] error: relation "users" does not exist
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'ERROR',
app-1  |   code: '42P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: '15',
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'parse_relation.c',
app-1  |   line: '1392',
app-1  |   routine: 'parserOpenTable'
app-1  | } SELECT * FROM users WHERE id = $1 [ 'usr-105288498' ]
app-1  | [Admin Auth] Error syncing user: error: relation "users" does not exist
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'ERROR',
app-1  |   code: '42P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: '15',
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'parse_relation.c',
app-1  |   line: '1392',
app-1  |   routine: 'parserOpenTable'
app-1  | }
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [DB GET Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } SELECT * FROM users WHERE id = $1 [ 'usr-6897919124' ]
app-1  | [Admin Auth] Error syncing user: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Orders] Error fetching orders: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2308:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
app-1  |  []
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Promocodes] Error fetching list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM users
app-1  |  []
app-1  | [Admin Auth] Error fetching users list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM users
app-1  |  []
app-1  | [Admin Auth] Error fetching users list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Orders] Error fetching orders: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Promocodes] Error fetching list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2308:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
app-1  |  []
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM users
app-1  |  []
app-1  | [Admin Auth] Error fetching users list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2308:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
app-1  |  []
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Orders] Error fetching orders: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Promocodes] Error fetching list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [DB GET Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } SELECT * FROM users WHERE id = $1 [ 'usr-105288498' ]
app-1  | [Admin Auth] Error syncing user: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.get (/app/dist/server.cjs:440:23)
app-1  |     at async /app/dist/server.cjs:1636:26 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | TypeError: Cannot read properties of undefined (reading 'toLowerCase')
app-1  |     at /app/dist/server.cjs:2476:20
app-1  |     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
app-1  |     at trim_prefix (/app/node_modules/express/lib/router/index.js:328:13)
app-1  |     at /app/node_modules/express/lib/router/index.js:286:9
app-1  |     at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
app-1  |     at next (/app/node_modules/express/lib/router/index.js:280:10)
app-1  |     at cookieParser (/app/node_modules/cookie-parser/index.js:57:14)
app-1  |     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
app-1  |     at trim_prefix (/app/node_modules/express/lib/router/index.js:328:13)
app-1  |     at /app/node_modules/express/lib/router/index.js:286:9
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [Admin Auth] /api/auth/admins requested, configured IDs: [ '7948060541', '6897919124' ]
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1986:18)
app-1  |     at async /app/dist/server.cjs:2127:23 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM user_purchases
app-1  |   WHERE (user_id = $1 OR (user_telegram_id IS NOT NULL AND user_telegram_id = $2))
app-1  |     AND status = 'active'
app-1  |   ORDER BY granted_at DESC NULLS LAST, id DESC
app-1  |  [ 'usr-7948060541', '7948060541' ]
app-1  | [GetPurchases] Error: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1986:18)
app-1  |     at async /app/dist/server.cjs:2127:23 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1986:18)
app-1  |     at async /app/dist/server.cjs:2127:23 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM user_purchases
app-1  |   WHERE (user_id = $1 OR (user_telegram_id IS NOT NULL AND user_telegram_id = $2))
app-1  |     AND status = 'active'
app-1  |   ORDER BY granted_at DESC NULLS LAST, id DESC
app-1  |  [ 'usr-7948060541', '7948060541' ]
app-1  | [GetPurchases] Error: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async getUserPurchasesDirect (/app/dist/server.cjs:1986:18)
app-1  |     at async /app/dist/server.cjs:2127:23 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM users
app-1  |  []
app-1  | [Admin Auth] Error fetching users list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Promocodes] Error fetching list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2308:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
app-1  |  []
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Orders] Error fetching orders: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM users
app-1  |  []
app-1  | [Admin Auth] Error fetching users list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:1727:24 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM orders ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Orders] Error fetching orders: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2030:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM promocodes ORDER BY created_at DESC NULLS LAST, id DESC
app-1  |  []
app-1  | [Promocodes] Error fetching list: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2222:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
app-1  | [DB ALL Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.all (/app/dist/server.cjs:450:23)
app-1  |     at async /app/dist/server.cjs:2308:18 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   SELECT * FROM system_logs ORDER BY timestamp DESC NULLS LAST, id DESC LIMIT 100
app-1  |  []
app-1  | [DB RUN Error] error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.run (/app/dist/server.cjs:460:23)
app-1  |     at async /app/dist/server.cjs:2161:5 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | } 
app-1  |   INSERT INTO user_purchases (
app-1  |     id, user_id, user_telegram_id, order_id, course_id,
app-1  |     course_title, subject, school, year, price,
app-1  |     granted_at, granted_by, status, expires_at, tariff_type
app-1  |   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', $13, $14)
app-1  |  [
app-1  |   'pur-admin-1789218440017',
app-1  |   'usr-7948060541',
app-1  |   '7948060541',
app-1  |   'admin_manual',
app-1  |   '10',
app-1  |   'Летняя школа БазМат ЕГЭЛенд 2026-2027',
app-1  |   'Обществознание',
app-1  |   'ЕГЭLAND',
app-1  |   '2027',
app-1  |   0,
app-1  |   '12.09.2026, 13:07:20',
app-1  |   'admin',
app-1  |   '2026-10-12T13:07:20.023Z',
app-1  |   'monthly'
app-1  | ]
app-1  | [Purchases] Error granting course: error: password authentication failed for user "postgres"
app-1  |     at /app/node_modules/pg-pool/index.js:45:11
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
app-1  |     at async Object.run (/app/dist/server.cjs:460:23)
app-1  |     at async /app/dist/server.cjs:2161:5 {
app-1  |   length: 104,
app-1  |   severity: 'FATAL',
app-1  |   code: '28P01',
app-1  |   detail: undefined,
app-1  |   hint: undefined,
app-1  |   position: undefined,
app-1  |   internalPosition: undefined,
app-1  |   internalQuery: undefined,
app-1  |   where: undefined,
app-1  |   schema: undefined,
app-1  |   table: undefined,
app-1  |   column: undefined,
app-1  |   dataType: undefined,
app-1  |   constraint: undefined,
app-1  |   file: 'auth.c',
app-1  |   line: '334',
app-1  |   routine: 'auth_failed'
app-1  | }
