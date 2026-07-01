import "server-only"
import mysql from "mysql2/promise"

/**
 * Shared MySQL connection pool.
 *
 * Configure these env vars (in .env.local for the Next.js app, and as real
 * environment variables on the Windows server in production):
 *   MYSQL_HOST=127.0.0.1
 *   MYSQL_PORT=3306
 *   MYSQL_USER=fxmirror
 *   MYSQL_PASSWORD=your_mysql_password
 *   MYSQL_DATABASE=fxmirror
 */
declare global {
  // eslint-disable-next-line no-var
  var __fxmirrorPool: mysql.Pool | undefined
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "fxmirror",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    dateStrings: false,
    timezone: "Z",
  })
}

// Reuse the pool across hot reloads in dev to avoid exhausting connections.
export const pool: mysql.Pool = global.__fxmirrorPool ?? createPool()
if (process.env.NODE_ENV !== "production") global.__fxmirrorPool = pool

/** Run a query and return typed rows. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params as never)
  return rows as T[]
}

/** Run a query and return the first row (or null). */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

/** Run a query and return all rows (alias of query, for readability). */
export async function queryMany<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T[]> {
  return query<T>(sql, params)
}
