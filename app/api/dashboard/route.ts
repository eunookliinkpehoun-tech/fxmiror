import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { queryOne, queryMany } from "@/lib/db"
import type { BotSession, BotState, Mt5Account, Mt5Status, Trade, ReferralStats } from "@/lib/dashboard-types"

type Mt5Row = {
  login: string
  server: string
  broker: string | null
  account_type: string | null
  leverage: number | null
  currency: string | null
  balance: string
  equity: string
  free_margin: string
  daily_profit: string
  is_demo: number
  status: Mt5Status
  status_message: string | null
  copy_enabled: number
  created_at: Date | null
  last_sync_at: Date | null
}

type BotRow = {
  state: "running" | "payment_due" | "closed"
  start_balance: string
  profit: string
  amount_due: string
  cycle_ends_at: Date | null
}

type TradeRow = {
  id: number
  symbol: string
  side: "BUY" | "SELL"
  volume: string
  profit: string | null
  opened_at: Date | null
  closed_at: Date | null
  created_at: Date
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, message: "Not authenticated." }, { status: 401 })

  const mt5Row = await queryOne<Mt5Row>("SELECT * FROM mt5_accounts WHERE user_id = :userId", { userId: user.id })

  const tradeRows = await queryMany<TradeRow>(
    "SELECT id, symbol, side, volume, profit, opened_at, closed_at, created_at FROM copied_trades WHERE user_id = :userId ORDER BY created_at DESC LIMIT 20",
    { userId: user.id },
  )

  const recentTrades: Trade[] = tradeRows.map((t) => ({
    id: String(t.id),
    symbol: t.symbol,
    side: t.side,
    volume: Number(t.volume),
    profit: t.profit != null ? Number(t.profit) : 0,
    executedAt: new Date(t.closed_at ?? t.opened_at ?? t.created_at).toISOString(),
  }))

  const lastTrade = recentTrades[0] ?? null

  const mt5Account: Mt5Account | null = mt5Row
    ? {
        login: mt5Row.login,
        server: mt5Row.server,
        broker: mt5Row.broker,
        accountType: mt5Row.account_type,
        leverage: mt5Row.leverage,
        currency: mt5Row.currency ?? "USD",
        balance: Number(mt5Row.balance),
        equity: Number(mt5Row.equity),
        freeMargin: Number(mt5Row.free_margin),
        dailyProfit: Number(mt5Row.daily_profit),
        isDemo: mt5Row.is_demo === 1,
        status: mt5Row.status,
        statusMessage: mt5Row.status_message,
        copyEnabled: mt5Row.copy_enabled === 1,
        connectedAt: mt5Row.created_at ? new Date(mt5Row.created_at).toISOString() : null,
        lastSyncedAt: mt5Row.last_sync_at ? new Date(mt5Row.last_sync_at).toISOString() : null,
        lastTradeSymbol: lastTrade?.symbol ?? null,
        lastTradeSide: lastTrade?.side ?? null,
        lastTradeProfit: lastTrade?.profit ?? null,
      }
    : null

  const botRow = await queryOne<BotRow>(
    "SELECT * FROM bot_sessions WHERE user_id = :userId AND state <> 'closed' ORDER BY created_at DESC LIMIT 1",
    { userId: user.id },
  )

  let botState: BotState = "offline"
  let botSession: BotSession | null = null

  if (mt5Account?.status === "connected") {
    if (botRow?.state === "running") botState = "running"
    else if (botRow?.state === "payment_due") botState = "payment_due"
    else botState = "running" // connected but no active cycle -> ready to START (handled by UI)
  }

  if (botRow) {
    botSession = {
      state: botRow.state,
      startBalance: Number(botRow.start_balance),
      profit: Number(botRow.profit),
      amountDue: Number(botRow.amount_due),
      cycleEndsAt: botRow.cycle_ends_at ? new Date(botRow.cycle_ends_at).toISOString() : null,
    }
  }

  // Referral stats
  const refCountRow = await queryOne<{ total: number; active: number }>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN m.status = 'connected' THEN 1 ELSE 0 END) AS active
     FROM users u
     LEFT JOIN mt5_accounts m ON m.user_id = u.id
     WHERE u.referred_by = :userId`,
    { userId: user.id },
  )
  const referral: ReferralStats = {
    count: Number(refCountRow?.total ?? 0),
    active: Number(refCountRow?.active ?? 0),
    earnings: 0,
  }

  const trialActive = !!user.trialEndsAt && new Date(user.trialEndsAt).getTime() > Date.now()

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode ?? null,
      trialActive,
      trialEndsAt: user.trialEndsAt ? new Date(user.trialEndsAt).toISOString() : null,
    },
    mt5Account,
    botState,
    botSession,
    copyTradeEnabled: mt5Account?.copyEnabled ?? false,
    recentTrades,
    referral,
  })
}
