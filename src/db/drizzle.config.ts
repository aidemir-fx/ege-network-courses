import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.POSTGRES_HOST || process.env.SQL_HOST || 'localhost';
const sqlDbName = process.env.POSTGRES_DB || process.env.SQL_DB_NAME || 'postgres';
const user = process.env.POSTGRES_USER || process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || 'postgres';
const port = Number(process.env.POSTGRES_PORT) || 5432;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    port: port,
    ssl: false,
  },
  verbose: true,
});
