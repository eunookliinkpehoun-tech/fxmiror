import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { queryMany, queryOne } from "@/lib/db"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "https://fxmirror.app"
  const referralCode = user.referralCode || ""
  const referralLink = referralCode ? `${origin}/?ref=${referralCode}` : ""

  const referrals = await queryMany<{
    id: string; name: string; email: string; date: string | null;
    status: "pending" | "active" | "rewarded" | "cancelled"; gain: number
  }>(
    `SELECT id, full_name AS name, email,
            created_at AS date,
            'active' AS status,
            0 AS gain
     FROM users WHERE referred_by = ? ORDER BY created_at DESC`,
    [user.id],
  )

  const countRow = await queryOne<{ referralCount: number; recentCount: number }>(
    `SELECT COUNT(*) AS referralCount,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS recentCount
     FROM users WHERE referred_by = ?`,
    [user.id],
  )

  return NextResponse.json({
    ok: true,
    referralCode,
    referralLink,
    stats: {
      referralCount: countRow?.referralCount ?? 0,
      recentCount: countRow?.recentCount ?? 0,
      availableBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    },
    referrals,
  })
}
