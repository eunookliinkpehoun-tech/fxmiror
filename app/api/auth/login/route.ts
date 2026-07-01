import { NextResponse } from "next/server"
import { queryOne } from "@/lib/db"
import { createSession, verifyPassword, type DbUser } from "@/lib/auth"

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 })
  }

  const user = await queryOne<DbUser>("SELECT * FROM users WHERE email = :email", { email })
  // Constant-ish response to avoid leaking which emails exist.
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ ok: false, message: "Incorrect email or password." }, { status: 401 })
  }

  await createSession(user.id)

  return NextResponse.json({ ok: true, message: "Signed in successfully." })
}
