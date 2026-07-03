import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { queryMany } from "@/lib/db"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const trades = await queryMany<{
    id: string; asset: string; type: string; volume: number; profit: number; closedAt: string | null
  }>(
    `SELECT id, symbol AS asset, side AS type, volume, profit,
            COALESCE(closed_at, created_at) AS closedAt
     FROM copied_trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`,
    [user.id],
  )

  return NextResponse.json({ ok: true, trades, depots: [], retraits: [] })
}
