import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { getSessionUser } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"
import { encryptSecret } from "@/lib/crypto"

/**
 * Save (or replace) the user's MT5 credentials.
 *
 * The Next.js app cannot talk to MetaTrader 5 directly, so it stores the
 * credentials encrypted with status = 'pending'. The Python engine running on
 * the Windows server picks up pending accounts, attempts the real MT5 login,
 * and updates the status to 'connected' (or 'error') plus the live balance.
 */
export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, message: "Not authenticated." }, { status: 401 })

  let body: { login?: string; password?: string; server?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 })
  }

  const login = (body.login ?? "").trim()
  const password = body.password ?? ""
  const server = (body.server ?? "").trim()

  if (!login || !password || !server) {
    return NextResponse.json(
      { ok: false, message: "Account number, password and server are required." },
      { status: 400 },
    )
  }
  if (!/^\d{4,15}$/.test(login)) {
    return NextResponse.json({ ok: false, message: "The account number must be digits only." }, { status: 400 })
  }

  // We CANNOT reliably tell demo vs real from the server name (e.g. "XMGlobal-MT5 9"
  // is a demo account but the name has no "demo" in it). Only MetaTrader 5 knows the
  // real type via account_info().trade_mode. So we save the credentials as 'pending'
  // and let the Python engine detect the real type on login and enforce the trial
  // rule (trial users may only run a DEMO account).
  const isDemoGuess = /demo/i.test(server)

  const passwordEnc = encryptSecret(password)
  const existing = await queryOne<{ id: string }>("SELECT id FROM mt5_accounts WHERE user_id = :userId", {
    userId: user.id,
  })

  if (existing) {
    await query(
      `UPDATE mt5_accounts
          SET login = :login, server = :server, password_enc = :passwordEnc,
              is_demo = :isDemo, status = 'pending', status_message = NULL, last_sync_at = NULL
        WHERE user_id = :userId`,
      { login, server, passwordEnc, isDemo: isDemoGuess ? 1 : 0, userId: user.id },
    )
  } else {
    await query(
      `INSERT INTO mt5_accounts (id, user_id, login, server, password_enc, is_demo, status)
       VALUES (:id, :userId, :login, :server, :passwordEnc, :isDemo, 'pending')`,
      { id: crypto.randomUUID(), userId: user.id, login, server, passwordEnc, isDemo: isDemoGuess ? 1 : 0 },
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Identifiants enregistrés. Vérification de la connexion à MT5 en cours...",
  })
}
