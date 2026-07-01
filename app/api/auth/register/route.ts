import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { query, queryOne } from "@/lib/db"
import { createSession, generateReferralCode, hashPassword } from "@/lib/auth"

const TRIAL_DAYS = 2

export async function POST(request: Request) {
  let body: { fullName?: string; email?: string; password?: string; referralCode?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 })
  }

  const fullName = (body.fullName ?? "").trim()
  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const referralCode = (body.referralCode ?? "").trim().toUpperCase()

  if (!fullName || !email || password.length < 8) {
    return NextResponse.json(
      { ok: false, message: "Please provide your name, email and a password of at least 8 characters." },
      { status: 400 },
    )
  }

  const existing = await queryOne("SELECT id FROM users WHERE email = :email", { email })
  if (existing) {
    return NextResponse.json({ ok: false, message: "An account already exists with this email." }, { status: 409 })
  }

  let referredBy: string | null = null
  if (referralCode) {
    const ref = await queryOne<{ id: string }>("SELECT id FROM users WHERE referral_code = :code", {
      code: referralCode,
    })
    referredBy = ref?.id ?? null
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

  // Generate a unique referral code for the new user.
  let myCode = generateReferralCode()
  for (let i = 0; i < 5; i++) {
    const clash = await queryOne("SELECT id FROM users WHERE referral_code = :code", { code: myCode })
    if (!clash) break
    myCode = generateReferralCode()
  }

  await query(
    `INSERT INTO users (id, full_name, email, password_hash, referral_code, referred_by, trial_ends_at)
     VALUES (:id, :fullName, :email, :passwordHash, :myCode, :referredBy, :trialEndsAt)`,
    { id, fullName, email, passwordHash, myCode, referredBy, trialEndsAt },
  )

  await createSession(id)

  return NextResponse.json({ ok: true, message: "Account created. Welcome to FXMIRROR!" })
}
