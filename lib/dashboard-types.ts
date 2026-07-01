export type Mt5Status = "pending" | "connected" | "error" | "disabled"

export type Mt5Account = {
  login: string
  server: string
  broker: string | null
  accountType: string | null
  leverage: number | null
  currency: string
  balance: number
  equity: number
  freeMargin: number
  dailyProfit: number
  isDemo: boolean
  status: Mt5Status
  statusMessage: string | null
  copyEnabled: boolean
  connectedAt: string | null
  lastSyncedAt: string | null
  lastTradeSymbol: string | null
  lastTradeSide: string | null
  lastTradeProfit: number | null
}

export type BotState = "offline" | "running" | "payment_due"

export type BotSession = {
  state: "running" | "payment_due" | "closed"
  startBalance: number
  profit: number
  amountDue: number
  cycleEndsAt: string | null
}

export type Trade = {
  id: string
  symbol: string
  side: "BUY" | "SELL"
  volume: number
  profit: number
  executedAt: string
}

export type ReferralStats = {
  count: number
  active: number
  earnings: number
}

export type DashboardUser = {
  id: string
  name: string
  email: string
  referralCode: string | null
  trialActive: boolean
  trialEndsAt: string | null
}

export type DashboardState = {
  user: DashboardUser
  mt5Account: Mt5Account | null
  botState: BotState
  botSession: BotSession | null
  copyTradeEnabled: boolean
}

export function isMt5Connected(account: Mt5Account | null | undefined): boolean {
  return account?.status === "connected"
}
