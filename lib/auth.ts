import "server-only"
import crypto from "node:crypto"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { query, queryOne } from "./db"

const SESSION_COOKIE = "fx_session"
const SESSION_DAYS = 30

export type DbUser = {
  id: string
  full_name: string
  email: string
  password_hash: string
  referral_code: string
  referred_by: string | null
  role: "user" | "admin"
  trial_ends_at: Date | null
  created_at: Date
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  referralCode: string | null
  trialEndsAt: Date | null
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase()
}

/** Create a server-side session and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const id = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (:id, :userId, :expires)",
    { id, userId, expires },
  )
  const jar = await cookies()
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  })
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const id = jar.get(SESSION_COOKIE)?.value
  if (id) {
    await query("DELETE FROM sessions WHERE id = :id", { id })
    jar.delete(SESSION_COOKIE)
  }
}

/** Read the current session user from the cookie, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies()
  const id = jar.get(SESSION_COOKIE)?.value
  if (!id) return null

  const row = await queryOne<DbUser & { expires_at: Date }>(
    `SELECT u.*, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = :id`,
    { id },
  )
  if (!row) return null
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM sessions WHERE id = :id", { id })
    return null
  }

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    referralCode: row.referral_code ?? null,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : null,
  }
}
