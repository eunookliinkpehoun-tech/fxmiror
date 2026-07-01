import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

/**
 * Settle the pending performance fee (50/50 of the cycle profit).
 * In production, wire this to a real payment provider (Stripe) and only
 * close the session after the payment webhook confirms. For now it closes
 * the payment_due session so a new cycle can start.
 */
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, message: "Not authenticated." }, { status: 401 })

  const due = await queryOne<{ id: string; amount_due: string }>(
    "SELECT id, amount_due FROM bot_sessions WHERE user_id = :userId AND state = 'payment_due' LIMIT 1",
    { userId: user.id },
  )
  if (!due) {
    return NextResponse.json({ ok: false, message: "No pending payment." }, { status: 400 })
  }

  await query("UPDATE bot_sessions SET state = 'closed' WHERE id = :id", { id: due.id })

  return NextResponse.json({
    ok: true,
    message: `Payment of $${Number(due.amount_due).toFixed(2)} settled. You can start a new cycle.`,
  })
}
