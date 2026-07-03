"use client"

import { useEffect, useState } from "react"
import { isMt5Connected } from "@/lib/dashboard-types"
import { AnimatedNumber } from "./animated-number"
import { useDashboard } from "./dashboard-context"

export function Mt5Account() {
  const { state, loading, openConnectModal } = useDashboard()
  const account = state?.mt5Account ?? null
  const connected = isMt5Connected(account)
  const trialActive = state?.user.trialActive

  // If verification stays "pending" too long, the Python engine is likely not
  // running on the Windows server. Warn the user after a delay.
  const isPending = account?.status === "pending"
  const [slowVerify, setSlowVerify] = useState(false)
  useEffect(() => {
    if (!isPending) {
      setSlowVerify(false)
      return
    }
    const t = setTimeout(() => setSlowVerify(true), 45000)
    return () => clearTimeout(t)
  }, [isPending])

  if (loading) {
    return (
      <section className="mt5-card glass-panel reveal">
        <div className="mt5-loading">Chargement du compte MT5...</div>
      </section>
    )
  }

  // Credentials saved, waiting for the Python engine to verify the login with MT5.
  if (account && account.status === "pending") {
    return (
      <section className="mt5-card mt5-status glass-panel reveal">
        <div className="mt5-status-inner">
          <span className="mt5-status-spinner" aria-hidden="true" />
          <h2 className="mt5-status-title">Vérification de la connexion MT5...</h2>
          <p className="mt5-status-text">
            Compte <strong>{account.login}</strong> sur <strong>{account.server}</strong>. La
            connexion est établie par le terminal MetaTrader 5. Cela peut prendre quelques
            secondes.
          </p>
          {slowVerify && (
            <p className="mt5-status-warn">
              La vérification prend plus de temps que prévu. Assurez-vous que le moteur Python
              (<code>python main.py</code>) tourne bien sur le serveur Windows où MetaTrader 5 est
              installé, et que le terminal MT5 est ouvert.
            </p>
          )}
          <button type="button" className="dash-btn dash-btn-secondary" onClick={openConnectModal}>
            Modifier les identifiants
          </button>
        </div>
      </section>
    )
  }

  // The engine tried to log in and failed (bad credentials, or real account during trial).
  if (account && account.status === "error") {
    return (
      <section className="mt5-card mt5-status mt5-status-error glass-panel reveal">
        <div className="mt5-status-inner">
          <span className="mt5-status-icon" aria-hidden="true">
            !
          </span>
          <h2 className="mt5-status-title">Connexion MT5 échouée</h2>
          <p className="mt5-status-text">
            {account.statusMessage ||
              "Impossible de se connecter. Vérifiez le numéro de compte, le mot de passe investisseur et le serveur."}
          </p>
          <button type="button" className="dash-btn dash-btn-primary" onClick={openConnectModal}>
            Réessayer
          </button>
        </div>
      </section>
    )
  }

  if (!connected || !account) {
    return (
      <section className="mt5-card mt5-empty glass-panel reveal">
        <button type="button" className="mt5-add-btn" onClick={openConnectModal}>
          <span className="mt5-add-icon">+</span>
          <span className="mt5-add-label">AJOUTER UN COMPTE</span>
          <span className="mt5-add-hint">
            {trialActive
              ? "Essai 2 jours — compte DEMO uniquement"
              : "Connectez votre compte MetaTrader 5"}
          </span>
        </button>
      </section>
    )
  }

  const infoRows = [
    { label: "Courtier", value: account.broker || "—" },
    { label: "Serveur", value: account.server },
    { label: "Numéro de compte", value: account.login },
    { label: "Type de compte", value: account.accountType || "—" },
    { label: "Levier", value: account.leverage ? `1:${account.leverage}` : "—" },
  ]

  const profitPrefix = account.dailyProfit >= 0 ? "+" : ""

  return (
    <section className="mt5-card glass-panel reveal">
      <div className="mt5-left">
        <div className="holo-ring">
          <span className="holo-ring-spin" />
          <span className="holo-ring-spin slow" />
          <div className="holo-core">
            <span className="holo-mt">MT</span>
            <span className="holo-5">5</span>
          </div>
        </div>
        <span className="status-badge connected">
          <span className="dot" />
          COMPTE CONNECTÉ
        </span>
        {account.isDemo && <span className="status-badge demo">ESSAI DEMO</span>}
      </div>

      <div className="mt5-center">
        <h2 className="mt5-title">MetaTrader 5 Connecté</h2>
        <p className="mt5-sub">Synchronisation active avec le serveur MT5.</p>
        <div className="mt5-info-grid">
          {infoRows.map((r) => (
            <div className="mt5-info-item" key={r.label}>
              <span className="mt5-info-label">{r.label}</span>
              <span className="mt5-info-value">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt5-balance">
        <div className="balance-main">
          <span className="balance-label">Solde actuel</span>
          <span className="balance-value">
            <AnimatedNumber value={account.balance} /> <small>{account.currency}</small>
          </span>
        </div>
        <div className="balance-sub">
          <div className="bal-stat">
            <span className="bal-stat-label">Équité</span>
            <span className="bal-stat-value equity">
              <AnimatedNumber value={account.equity} /> <small>{account.currency}</small>
            </span>
          </div>
          <div className="bal-stat">
            <span className="bal-stat-label">Marge libre</span>
            <span className="bal-stat-value margin">
              <AnimatedNumber value={account.freeMargin} /> <small>{account.currency}</small>
            </span>
          </div>
          <div className="bal-stat">
            <span className="bal-stat-label">Profit du jour</span>
            <span className="bal-stat-value profit">
              {profitPrefix}
              <AnimatedNumber value={Math.abs(account.dailyProfit)} /> <small>{account.currency}</small>
            </span>
          </div>
        </div>
      </div>

      <div className="sync-bar">
        <div className="sync-bar-left">
          <span className="sync-pulse" />
          <span className="sync-text">Synchronisation Temps Réel Active</span>
        </div>
        <svg className="sync-graph" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points="0,30 20,26 40,28 60,18 80,22 100,12 120,20 140,8 160,16 180,6 200,14 220,4 240,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
