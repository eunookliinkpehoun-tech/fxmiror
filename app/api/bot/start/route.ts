import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { getSessionUser } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

/**
 * Start a 24h copy cycle for the current user.
 * Records the current balance as the cycle's starting balance. The Python
 * engine updates profit during the cycle and flips the session to
 * 'payment_due' when the 24h window ends with a positive profit.
 */
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, message: "Not authenticated." }, { status: 401 })

  const mt5 = await queryOne<{ status: string; balance: string }>(
    "SELECT status, balance FROM mt5_accounts WHERE user_id = :userId",
    { userId: user.id },
  )

  if (!mt5 || mt5.status !== "connected") {
    return NextResponse.json(
      { ok: false, message: "Connect your MT5 account before starting the bot." },
      { status: 400 },
    )
  }

  const active = await queryOne<{ id: string }>(
    "SELECT id FROM bot_sessions WHERE user_id = :userId AND state <> 'closed'",
    { userId: user.id },
  )
  if (active) {
    return NextResponse.json({ ok: false, message: "A cycle is already running." }, { status: 409 })
  }

  const cycleEnds = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await query(
    `INSERT INTO bot_sessions (id, user_id, state, start_balance, profit, amount_due, cycle_ends_at)
     VALUES (:id, :userId, 'running', :startBalance, 0, 0, :cycleEnds)`,
    { id: crypto.randomUUID(), userId: user.id, startBalance: Number(mt5.balance), cycleEnds },
  )

  return NextResponse.json({ ok: true, message: "Bot started. 24h cycle is now running." })
}
