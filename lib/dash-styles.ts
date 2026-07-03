export const dashBaseStyles = `
  .dash-root {
    --d-blue-900: #06122e;
    --d-blue-800: #0a1f4d;
    --d-blue-700: #0d2c6b;
    --d-blue-600: #1546a0;
    --d-blue: #2563eb;
    --d-blue-400: #3b82f6;
    --d-blue-300: #60a5fa;
    --d-blue-200: #93c5fd;
    --d-cyan: #22d3ee;
    --d-green: #16c784;
    --d-red: #ef4444;
    --d-amber: #f59e0b;
    --d-bg: #eef3fc;
    --d-surface: rgba(255,255,255,0.62);
    --d-surface-strong: rgba(255,255,255,0.82);
    --d-border: rgba(255,255,255,0.7);
    --d-ink: #0a1730;
    --d-muted: #5b6b8c;
    --d-shadow: 0 20px 60px rgba(21,70,160,0.16);
    --d-radius: 20px;

    position: relative;
    min-height: 100vh;
    color: var(--d-ink);
    line-height: 1.55;
    overflow-x: hidden;
    background:
      radial-gradient(900px 500px at 85% -10%, rgba(59,130,246,0.16), transparent 60%),
      radial-gradient(700px 500px at -10% 15%, rgba(34,211,238,0.12), transparent 55%),
      var(--d-bg);
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .dash-root * { box-sizing: border-box; }
  .dash-root h1, .dash-root h2, .dash-root h3, .dash-root h4, .dash-root p { margin: 0; padding: 0; }

  .dash-root.dash-dark {
    --d-bg: #060d1f;
    --d-surface: rgba(17,28,54,0.66);
    --d-surface-strong: rgba(20,33,63,0.9);
    --d-border: rgba(96,165,250,0.18);
    --d-ink: #eaf1ff;
    --d-muted: #93a6c8;
    --d-shadow: 0 20px 60px rgba(0,0,0,0.5);
    background:
      radial-gradient(900px 500px at 85% -10%, rgba(37,99,235,0.22), transparent 60%),
      radial-gradient(700px 500px at -10% 15%, rgba(34,211,238,0.12), transparent 55%),
      var(--d-bg);
  }

  .glass-panel {
    background: var(--d-surface);
    border: 1px solid var(--d-border);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    box-shadow: var(--d-shadow);
    border-radius: var(--d-radius);
  }

  .dash-bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    -webkit-mask-image: radial-gradient(circle at 50% 0%, black 0%, transparent 75%);
    mask-image: radial-gradient(circle at 50% 0%, black 0%, transparent 75%);
  }
  .dash-orb { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.4; pointer-events: none; }
  .dash-orb-1 { width: 420px; height: 420px; background: var(--d-blue-300); top: -140px; right: -100px; }
  .dash-orb-2 { width: 360px; height: 360px; background: var(--d-cyan); bottom: 0; left: -120px; }

  .dash-action-toast {
    position: fixed; top: 18px; right: 18px; z-index: 200;
    max-width: min(360px, calc(100vw - 32px)); padding: 13px 16px;
    border-radius: 14px; color: #fff; font-weight: 800; font-size: .9rem;
    box-shadow: 0 18px 45px rgba(6,18,46,0.26); animation: dtoastin .28s ease both;
  }
  .dash-action-toast.success { background: linear-gradient(135deg, #059669, #10b981); }
  .dash-action-toast.error { background: linear-gradient(135deg, #b91c1c, #ef4444); }
  .dash-action-toast.warning { background: linear-gradient(135deg, #b45309, #f59e0b); color: #111827; }
  @keyframes dtoastin { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

  .icon-btn {
    display: inline-grid; place-items: center; width: 40px; height: 40px;
    border-radius: 12px; border: 1px solid var(--d-border);
    background: var(--d-surface); color: var(--d-ink); cursor: pointer;
    transition: transform .15s, background .2s; position: relative;
  }
  .icon-btn:hover { transform: translateY(-1px); background: var(--d-surface-strong); }
  .icon-btn svg { width: 18px; height: 18px; }

  .dash-btn {
    display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    border: none; font-weight: 700; font-size: .9rem; font-family: inherit;
    padding: 11px 18px; border-radius: 12px; transition: transform .18s, box-shadow .2s, background .2s;
  }
  .dash-btn-primary { background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); color: #fff; box-shadow: 0 10px 24px rgba(37,99,235,0.35); }
  .dash-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(37,99,235,0.5); }
  .dash-btn-secondary { background: var(--d-surface-strong); border: 1px solid var(--d-border); color: var(--d-blue-600); }
  .dash-btn-secondary:hover { transform: translateY(-2px); }
  .dash-btn-ghost { background: transparent; border: 1px solid var(--d-border); color: var(--d-muted); }
  .dash-btn:disabled { opacity: .6; cursor: wait; transform: none; }

  .reveal { animation: dreveal .5s ease both; }
  @keyframes dreveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`

export const dashDashboardStyles = `
  .dash-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    background: var(--d-surface-strong);
    border-bottom: 1px solid var(--d-border);
  }
  .dash-header-inner {
    width: min(1240px, 94%); margin: 0 auto;
    display: flex; align-items: center; gap: 14px; padding: 12px 0;
  }
  .dash-menu-toggle { display: none; }
  .dash-logo { display: inline-flex; align-items: center; text-decoration: none; }
  .dash-logo-img { display: block; height: 34px; width: 166px; --fx-logo-accent: var(--d-blue-600); --fx-logo-text: var(--d-ink); }
  .dash-header-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

  .mt5-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 14px; border-radius: 999px; font-size: .74rem; font-weight: 800; letter-spacing: .3px;
    background: rgba(22,199,132,0.12); color: #0f9d63; border: 1px solid rgba(22,199,132,0.3);
  }
  .mt5-pill .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--d-green); box-shadow: 0 0 8px var(--d-green); animation: dpulse 1.4s infinite; }
  .mt5-pill.offline { background: rgba(239,68,68,0.1); color: #d33; border-color: rgba(239,68,68,0.3); }
  .mt5-pill.offline .dot { background: var(--d-red); box-shadow: 0 0 8px var(--d-red); }
  @keyframes dpulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

  .notif .notif-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--d-red); }
  .dash-avatar {
    width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
    background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); color: #fff; font-weight: 800; font-size: .85rem;
  }

  .dash-layout { width: min(1240px, 94%); margin: 0 auto; display: flex; gap: 26px; padding: 26px 0 60px; position: relative; z-index: 1; }
  .dash-sidebar-scrim { display: none; }
  .dash-sidebar {
    flex: 0 0 240px; align-self: flex-start; position: sticky; top: 84px;
    display: flex; flex-direction: column; gap: 18px;
    background: var(--d-surface); border: 1px solid var(--d-border); backdrop-filter: blur(16px);
    border-radius: var(--d-radius); padding: 20px; box-shadow: var(--d-shadow);
  }
  .dash-sidebar-mobile-head { display: none; }
  .dash-sidebar-user { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--d-border); }
  .dash-sidebar-avatar { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); color: #fff; font-weight: 800; }
  .dash-sidebar-name { font-weight: 700; font-size: .95rem; color: var(--d-ink); }
  .dash-sidebar-role { font-size: .78rem; color: var(--d-muted); }

  .dash-nav-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .dash-nav-link {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px;
    text-decoration: none; color: var(--d-muted); font-weight: 600; font-size: .92rem; transition: background .2s, color .2s;
  }
  .dash-nav-link svg { width: 19px; height: 19px; }
  .dash-nav-link:hover { background: rgba(37,99,235,0.08); color: var(--d-blue-600); }
  .dash-nav-link.active { background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); color: #fff; box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
  .dash-logout-btn {
    display: flex; align-items: center; gap: 10px; margin-top: auto; padding: 12px 14px; border-radius: 12px;
    border: 1px solid var(--d-border); background: transparent; color: var(--d-muted); font-weight: 600; font-family: inherit;
    cursor: pointer; transition: background .2s, color .2s;
  }
  .dash-logout-btn:hover { background: rgba(239,68,68,0.1); color: var(--d-red); }

  .dash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 26px; }

  .dash-welcome h1 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; color: var(--d-ink); }
  .dash-welcome p { color: var(--d-muted); margin-top: 4px; }
  .dash-trial-banner {
    display: inline-block; margin-top: 10px; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: .82rem;
    background: rgba(245,158,11,0.14); color: #b45309; border: 1px solid rgba(245,158,11,0.35);
  }

  .dash-section-title { font-size: 1.05rem; font-weight: 800; color: var(--d-ink); margin-bottom: 14px; }
  .dash-section-title.flush { margin-bottom: 0; }

  .dash-page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .dash-page-head h1 { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 800; color: var(--d-ink); }
  .dash-page-head p { color: var(--d-muted); margin-top: 4px; }

  /* MT5 account card */
  .mt5-card { padding: 26px; display: grid; grid-template-columns: auto 1fr auto; gap: 26px; align-items: center; overflow: hidden; }
  .mt5-loading { color: var(--d-muted); padding: 20px; }
  .mt5-empty { display: flex; }
  .mt5-add-btn {
    width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px;
    border: 2px dashed rgba(37,99,235,0.3); border-radius: 16px; background: transparent; cursor: pointer;
    color: var(--d-blue-600); transition: background .2s, border-color .2s;
  }
  .mt5-add-btn:hover { background: rgba(37,99,235,0.05); border-color: var(--d-blue); }
  .mt5-add-icon { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-size: 2rem; background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); color: #fff; }
  .mt5-add-label { font-weight: 800; letter-spacing: .5px; }
  .mt5-add-hint { font-size: .85rem; color: var(--d-muted); }

  .mt5-status { display: flex; }
  .mt5-status-inner { width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 40px 24px; }
  .mt5-status-title { font-size: 1.2rem; font-weight: 800; margin: 0; }
  .mt5-status-text { font-size: .9rem; color: var(--d-muted); max-width: 460px; line-height: 1.5; margin: 0; }
  .mt5-status-spinner { width: 44px; height: 44px; border-radius: 50%; border: 4px solid rgba(37,99,235,0.2); border-top-color: var(--d-blue); animation: mt5spin 0.9s linear infinite; }
  @keyframes mt5spin { to { transform: rotate(360deg); } }
  .mt5-status-error .mt5-status-title { color: #dc2626; }
  .mt5-status-icon { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 1.6rem; font-weight: 900; background: rgba(220,38,38,0.12); color: #dc2626; }
  .mt5-status-warn { font-size: .85rem; color: #b45309; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 12px 14px; max-width: 480px; line-height: 1.5; margin: 0; }
  .mt5-status-warn code { background: rgba(0,0,0,0.06); padding: 1px 6px; border-radius: 5px; font-size: .82rem; }

  .mt5-left { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .holo-ring { position: relative; width: 96px; height: 96px; display: grid; place-items: center; }
  .holo-ring-spin { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: var(--d-blue); border-right-color: var(--d-cyan); animation: dspin 3s linear infinite; }
  .holo-ring-spin.slow { inset: 10px; border-top-color: var(--d-cyan); border-right-color: transparent; border-left-color: var(--d-blue-300); animation-duration: 5s; animation-direction: reverse; }
  @keyframes dspin { to { transform: rotate(360deg); } }
  .holo-core { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--d-blue-700), var(--d-blue)); color: #fff; box-shadow: 0 10px 24px rgba(37,99,235,0.45); }
  .holo-core .holo-mt { font-weight: 800; font-size: 1.1rem; }
  .holo-core .holo-5 { font-weight: 800; font-size: 1.1rem; color: var(--d-cyan); }

  .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: .7rem; font-weight: 800; letter-spacing: .4px; }
  .status-badge.connected { background: rgba(22,199,132,0.14); color: #0f9d63; }
  .status-badge.connected .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--d-green); animation: dpulse 1.4s infinite; }
  .status-badge.demo { background: rgba(245,158,11,0.16); color: #b45309; }

  .mt5-center { min-width: 0; }
  .mt5-title { font-size: 1.25rem; font-weight: 800; color: var(--d-ink); }
  .mt5-sub { color: var(--d-muted); font-size: .9rem; margin-top: 2px; }
  .mt5-info-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px 20px; margin-top: 16px; }
  .mt5-info-item { display: flex; flex-direction: column; }
  .mt5-info-label { font-size: .72rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .4px; }
  .mt5-info-value { font-weight: 700; color: var(--d-ink); font-size: .92rem; }

  .mt5-balance { text-align: right; min-width: 200px; }
  .balance-label { font-size: .78rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .5px; }
  .balance-value { display: block; font-size: 2rem; font-weight: 800; color: var(--d-ink); }
  .balance-value small { font-size: .9rem; color: var(--d-muted); font-weight: 700; }
  .balance-sub { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
  .bal-stat { display: flex; justify-content: space-between; gap: 16px; }
  .bal-stat-label { font-size: .82rem; color: var(--d-muted); }
  .bal-stat-value { font-weight: 700; font-size: .9rem; }
  .bal-stat-value.equity { color: var(--d-blue); }
  .bal-stat-value.margin { color: var(--d-cyan); }
  .bal-stat-value.profit { color: var(--d-green); }
  .bal-stat-value small { color: var(--d-muted); font-weight: 600; font-size: .75rem; }

  .sync-bar { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-top: 18px; margin-top: 4px; border-top: 1px solid var(--d-border); }
  .sync-bar-left { display: flex; align-items: center; gap: 10px; }
  .sync-pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--d-green); box-shadow: 0 0 0 0 rgba(22,199,132,0.5); animation: dsyncpulse 1.8s infinite; }
  @keyframes dsyncpulse { 0% { box-shadow: 0 0 0 0 rgba(22,199,132,0.5); } 70% { box-shadow: 0 0 0 12px rgba(22,199,132,0); } 100% { box-shadow: 0 0 0 0 rgba(22,199,132,0); } }
  .sync-text { font-weight: 700; font-size: .88rem; color: var(--d-ink); }
  .sync-graph { width: 240px; height: 40px; color: var(--d-blue); flex: 0 0 auto; }

  /* Bot */
  .bot-grid { display: grid; gap: 18px; }
  .bot-grid-single { grid-template-columns: 1fr; }
  .bot-card { padding: 26px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; position: relative; }
  .bot-card-head { display: flex; align-items: center; justify-content: space-between; }
  .bot-icon { position: relative; width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; color: #fff; }
  .bot-icon svg { width: 30px; height: 30px; position: relative; z-index: 1; }
  .bot-icon-ring { position: absolute; inset: 0; border-radius: 16px; }
  .state-active .bot-icon { background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); box-shadow: 0 10px 24px rgba(37,99,235,0.4); }
  .state-pause .bot-icon { background: linear-gradient(135deg, var(--d-amber), #d97706); box-shadow: 0 10px 24px rgba(245,158,11,0.4); }
  .state-offline .bot-icon { background: linear-gradient(135deg, #94a3b8, #64748b); }
  .bot-badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 999px; font-size: .72rem; font-weight: 800; letter-spacing: .4px; }
  .state-active .bot-badge { background: rgba(22,199,132,0.14); color: #0f9d63; }
  .state-pause .bot-badge { background: rgba(245,158,11,0.16); color: #b45309; }
  .state-offline .bot-badge { background: rgba(148,163,184,0.2); color: #64748b; }
  .bot-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: dpulse 1.4s infinite; }
  .bot-title { font-size: 1.15rem; font-weight: 800; color: var(--d-ink); }
  .bot-desc { color: var(--d-muted); font-size: .92rem; }
  .bot-btn {
    align-self: flex-start; padding: 12px 26px; border-radius: 12px; border: none; cursor: pointer;
    font-weight: 800; letter-spacing: .5px; font-family: inherit; color: #fff;
    background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600)); box-shadow: 0 10px 24px rgba(37,99,235,0.4);
    display: inline-flex; align-items: center; gap: 8px; transition: transform .18s, box-shadow .2s;
  }
  .state-pause .bot-btn { background: linear-gradient(135deg, var(--d-amber), #d97706); box-shadow: 0 10px 24px rgba(245,158,11,0.4); }
  .state-offline .bot-btn { background: linear-gradient(135deg, #64748b, #475569); box-shadow: none; }
  .bot-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .bot-btn.locked, .bot-btn:disabled { opacity: .7; cursor: not-allowed; }
  .bot-btn .lock { display: inline-flex; }
  .bot-cycle-note { margin-top: 10px; color: var(--d-green); font-weight: 700; font-size: .9rem; }

  /* Sync details */
  .sync-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 20px; }
  .sync-block { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 14px; }
  .sync-block + .sync-block { border-left: 1px solid var(--d-border); }
  .sync-block-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: rgba(37,99,235,0.1); color: var(--d-blue); flex: 0 0 auto; }
  .sync-block-icon svg { width: 20px; height: 20px; }
  .sync-block > div { display: flex; flex-direction: column; }
  .sync-block-label { font-size: .74rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .3px; }
  .sync-block-value { font-weight: 700; color: var(--d-ink); font-size: .95rem; }
  .sync-block-note { font-size: .78rem; color: var(--d-muted); }
  .health-icon { background: rgba(22,199,132,0.12); color: var(--d-green); }
  .health-badge { font-weight: 800; font-size: .95rem; }
  .health-badge.excellent { color: var(--d-green); }
  .health-bars { display: flex; gap: 4px; margin-top: 6px; }
  .health-bars span { width: 14px; height: 6px; border-radius: 3px; background: rgba(148,163,184,0.3); }
  .health-bars span.on { background: var(--d-green); }

  /* Performance */
  .perf-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 22px; }
  .chart-card { padding: 22px; }
  .chart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .chart-tag { padding: 5px 12px; border-radius: 999px; font-size: .76rem; font-weight: 800; background: rgba(22,199,132,0.14); color: #0f9d63; }
  .chart-body { position: relative; height: 200px; }
  .chart-svg { width: 100%; height: 100%; }
  .chart-dot { position: absolute; top: 16%; right: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--d-blue); box-shadow: 0 0 0 4px rgba(37,99,235,0.2); }

  .ops-card { padding: 22px; }
  .ops-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .ops-link { background: none; border: none; color: var(--d-blue); font-weight: 700; font-size: .82rem; cursor: pointer; text-decoration: none; }
  .ops-table { display: flex; flex-direction: column; gap: 8px; }
  .ops-empty { color: var(--d-muted); font-size: .9rem; padding: 10px 0; }
  .ops-row { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; padding: 12px 14px; border-radius: 12px; background: rgba(37,99,235,0.04); }
  .ops-cell { display: flex; flex-direction: column; }
  .ops-pair { font-weight: 700; color: var(--d-ink); font-size: .92rem; }
  .ops-date { font-size: .76rem; color: var(--d-muted); }
  .ops-type { padding: 4px 12px; border-radius: 8px; font-size: .74rem; font-weight: 800; letter-spacing: .3px; }
  .ops-type.buy { background: rgba(22,199,132,0.14); color: #0f9d63; }
  .ops-type.sell { background: rgba(239,68,68,0.12); color: #d33; }
  .ops-amount { font-weight: 800; font-size: .9rem; }
  .ops-amount.win { color: var(--d-green); }
  .ops-amount.loss { color: var(--d-red); }
  .ta-right { text-align: right; }

  /* Tables + stat cards for secondary pages */
  .dash-table-card { padding: 22px; }
  .dash-table { display: flex; flex-direction: column; }
  .dash-table-head, .dash-table-row { display: grid; grid-template-columns: 1.2fr .8fr .8fr 1.4fr .8fr; gap: 12px; align-items: center; padding: 12px 8px; }
  .dash-table-head { font-size: .74rem; text-transform: uppercase; letter-spacing: .4px; color: var(--d-muted); border-bottom: 1px solid var(--d-border); }
  .dash-table-row { border-bottom: 1px solid var(--d-border); }
  .dash-table-row:last-child { border-bottom: none; }

  .dash-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .dash-stat-card { padding: 22px; display: flex; flex-direction: column; gap: 6px; }
  .dash-stat-label { font-size: .8rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .4px; }
  .dash-stat-value { font-size: 1.8rem; font-weight: 800; color: var(--d-ink); }

  .dash-referral-card, .dash-settings-card { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .dash-referral-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .dash-referral-code { flex: 0 0 auto; padding: 12px 18px; border-radius: 12px; background: rgba(37,99,235,0.08); color: var(--d-blue-700); font-weight: 800; letter-spacing: 1px; font-size: 1.05rem; }
  .dash-referral-input { flex: 1; min-width: 200px; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--d-border); background: var(--d-surface-strong); color: var(--d-ink); font-family: inherit; }

  .dash-settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 24px; }
  .dash-settings-item { display: flex; flex-direction: column; gap: 2px; }
  .dash-settings-label { font-size: .74rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .4px; }
  .dash-settings-value { font-weight: 700; color: var(--d-ink); }
  .dash-settings-desc { color: var(--d-muted); font-size: .92rem; }

  /* MT5 connect modal */
  .mt5-modal-scrim { position: fixed; inset: 0; z-index: 120; background: rgba(6,18,46,0.55); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: dtoastin .25s ease; }
  .mt5-modal { width: min(460px, 100%); max-height: calc(100dvh - 40px); overflow-y: auto; padding: 28px; }
  .mt5-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .mt5-modal-head h3 { font-size: 1.3rem; font-weight: 800; color: var(--d-ink); }
  .mt5-modal-alert { margin: 10px 0; padding: 10px 14px; border-radius: 12px; background: rgba(245,158,11,0.14); color: #b45309; font-size: .85rem; font-weight: 600; border: 1px solid rgba(245,158,11,0.3); }
  .mt5-modal-sub { color: var(--d-muted); font-size: .88rem; margin-bottom: 18px; }
  .mt5-modal-form { display: flex; flex-direction: column; gap: 14px; }
  .mt5-modal-form label { display: flex; flex-direction: column; gap: 6px; }
  .mt5-modal-form label span { font-size: .82rem; font-weight: 700; color: var(--d-ink); }
  .mt5-modal-form input { padding: 13px 16px; border-radius: 12px; border: 1px solid var(--d-border); background: var(--d-surface-strong); color: var(--d-ink); font-family: inherit; font-size: .95rem; outline: none; transition: border .2s, box-shadow .2s; }
  .mt5-modal-form input:focus { border-color: var(--d-blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
  .mt5-modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }

  /* ── Tabs ──────────────────────────────────────────────────────── */
  .dash-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .dash-tab {
    padding: 9px 20px; border-radius: 10px; border: 1px solid var(--d-border);
    background: var(--d-surface); color: var(--d-muted); font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: background .2s, color .2s, box-shadow .2s; font-family: inherit;
  }
  .dash-tab:hover { background: var(--d-surface-strong); color: var(--d-ink); }
  .dash-tab.active {
    background: linear-gradient(135deg, var(--d-blue), var(--d-blue-600));
    color: #fff; border-color: transparent; box-shadow: 0 8px 20px rgba(37,99,235,0.32);
  }

  /* ── Filter bar ─────────────────────────────────────────────────── */
  .dash-filter-bar {
    display: flex; align-items: center; gap: 12px; padding: 16px 20px;
    border-bottom: 1px solid var(--d-border); flex-wrap: wrap;
  }
  .dash-search-wrap {
    display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px;
    background: var(--d-surface-strong); border: 1px solid var(--d-border);
    border-radius: 10px; padding: 0 14px;
  }
  .dash-search-wrap svg { color: var(--d-muted); flex: 0 0 auto; }
  .dash-input {
    flex: 1; border: none; background: transparent; color: var(--d-ink);
    font-family: inherit; font-size: .9rem; padding: 10px 0; outline: none;
  }
  .dash-input::placeholder { color: var(--d-muted); }
  .dash-select {
    padding: 10px 14px; border-radius: 10px; border: 1px solid var(--d-border);
    background: var(--d-surface-strong); color: var(--d-ink); font-family: inherit;
    font-size: .88rem; cursor: pointer; outline: none;
  }

  /* ── Full-width table (history / referral) ──────────────────────── */
  .dash-table-wrap { overflow-x: auto; }
  .dash-section-head {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--d-border);
  }
  .dash-table-full {
    width: 100%; border-collapse: collapse; font-size: .9rem;
  }
  .dash-table-full thead tr {
    border-bottom: 1px solid var(--d-border);
  }
  .dash-table-full th {
    padding: 12px 20px; text-align: left; font-size: .74rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .4px; color: var(--d-muted); white-space: nowrap;
  }
  .dash-table-full td {
    padding: 14px 20px; border-bottom: 1px solid var(--d-border); vertical-align: middle;
  }
  .dash-table-full tbody tr:last-child td { border-bottom: none; }
  .dash-table-full tbody tr:hover td { background: rgba(37,99,235,0.03); }
  .dash-table-full th.right, .dash-table-full td.right { text-align: right; }
  .dash-empty-cell { text-align: center; padding: 36px 20px !important; color: var(--d-muted); font-size: .9rem; }
  .date-cell { color: var(--d-muted); font-family: ui-monospace, monospace; font-size: .84rem; }

  /* Asset cell */
  .asset-cell { display: flex; align-items: center; gap: 10px; }
  .asset-icon {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
    background: rgba(37,99,235,0.1); color: var(--d-blue); flex: 0 0 auto;
  }
  .asset-icon svg { width: 16px; height: 16px; }
  .asset-name { font-weight: 700; color: var(--d-ink); }

  /* Type badge */
  .type-badge {
    display: inline-block; padding: 4px 12px; border-radius: 8px;
    font-size: .74rem; font-weight: 800; letter-spacing: .3px;
  }
  .type-badge.buy { background: rgba(22,199,132,0.14); color: #0f9d63; }
  .type-badge.sell { background: rgba(239,68,68,0.12); color: #d33; }

  /* P/L colours */
  .pl-win { color: var(--d-green); font-weight: 800; font-family: ui-monospace, monospace; }
  .pl-loss { color: var(--d-red); font-weight: 800; font-family: ui-monospace, monospace; }

  /* Status pill */
  .status-pill {
    display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px;
    border-radius: 999px; font-size: .74rem; font-weight: 800; letter-spacing: .3px;
  }
  .status-pill.active { background: rgba(22,199,132,0.14); color: #0f9d63; }
  .status-pill.pending { background: rgba(245,158,11,0.16); color: #b45309; }
  .sdot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

  /* Pagination */
  .dash-pagination {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 14px 20px; border-top: 1px solid var(--d-border); flex-wrap: wrap;
    font-size: .84rem; color: var(--d-muted);
  }
  .dash-pager { display: flex; gap: 6px; }
  .dash-page-btn {
    min-width: 36px; height: 36px; padding: 0 10px; border-radius: 9px;
    border: 1px solid var(--d-border); background: var(--d-surface); color: var(--d-ink);
    font-weight: 700; font-size: .84rem; cursor: pointer; display: inline-grid; place-items: center;
    transition: background .15s, color .15s;
  }
  .dash-page-btn:hover:not(:disabled) { background: var(--d-surface-strong); }
  .dash-page-btn.active { background: var(--d-blue); color: #fff; border-color: var(--d-blue); }
  .dash-page-btn:disabled { opacity: .45; cursor: default; }

  /* ── Referral page ──────────────────────────────────────────────── */
  .ref-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
  .ref-link-card { padding: 26px; display: flex; flex-direction: column; gap: 16px; }
  .ref-link-head { display: flex; align-items: center; gap: 12px; }
  .ref-link-head svg { color: var(--d-blue); flex: 0 0 auto; }
  .ref-link-head h2 { font-size: 1.1rem; font-weight: 800; color: var(--d-ink); }
  .ref-link-box { display: flex; gap: 10px; align-items: center; }
  .ref-link-input {
    flex: 1; padding: 11px 14px; border-radius: 11px; border: 1px solid var(--d-border);
    background: var(--d-surface-strong); color: var(--d-ink); font-family: ui-monospace, monospace;
    font-size: .82rem; outline: none; min-width: 0;
  }
  .ref-share-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .ref-share-label {
    font-size: .72rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    color: var(--d-muted); width: 100%; margin-bottom: -4px;
  }
  .ref-share-btn {
    width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--d-border);
    background: var(--d-surface); color: var(--d-ink); cursor: pointer; display: grid; place-items: center;
    transition: background .15s, transform .15s;
  }
  .ref-share-btn:hover { background: var(--d-surface-strong); transform: translateY(-1px); }

  .ref-stats { display: flex; flex-direction: column; gap: 16px; }
  .ref-stat-card { padding: 22px; display: flex; flex-direction: column; gap: 8px; }
  .ref-stat-label { font-size: .78rem; color: var(--d-muted); text-transform: uppercase; letter-spacing: .4px; }
  .ref-stat-value { font-size: 1.9rem; font-weight: 800; color: var(--d-ink); display: flex; align-items: center; gap: 10px; }
  .ref-stat-badge {
    font-size: .72rem; font-weight: 700; padding: 4px 10px; border-radius: 999px;
    background: rgba(22,199,132,0.14); color: #0f9d63;
  }
  .ref-stat-note { font-size: .8rem; color: var(--d-muted); margin-top: 2px; }
  .ref-balance-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .ref-withdraw-btn { padding: 10px 16px !important; font-size: .82rem !important; }

  @media (max-width: 860px) {
    .ref-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 1000px) {
    .mt5-card { grid-template-columns: 1fr; text-align: left; }
    .mt5-left { flex-direction: row; align-items: center; }
    .mt5-balance { text-align: left; }
    .perf-grid { grid-template-columns: 1fr; }
    .sync-grid { grid-template-columns: repeat(2, 1fr); }
    .sync-block + .sync-block { border-left: none; }
  }
  @media (max-width: 820px) {
    .dash-menu-toggle { display: inline-grid; }
    .dash-sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; width: 280px; max-width: 84vw; z-index: 90;
      border-radius: 0 var(--d-radius) var(--d-radius) 0; transform: translateX(-105%); transition: transform .3s ease;
      height: 100dvh; overflow-y: auto;
    }
    .dash-sidebar.mobile-open { transform: translateX(0); }
    .dash-sidebar-mobile-head { display: flex; align-items: center; justify-content: space-between; }
    .dash-sidebar-scrim { display: block; position: fixed; inset: 0; z-index: 80; background: rgba(6,18,46,0.5); border: none; opacity: 0; pointer-events: none; transition: opacity .3s; }
    .dash-sidebar-scrim.show { opacity: 1; pointer-events: auto; }
    .dash-layout { padding-top: 20px; }
    .dash-stat-grid { grid-template-columns: 1fr; }
    .dash-settings-grid { grid-template-columns: 1fr; }
    .mt5-info-grid { grid-template-columns: 1fr 1fr; }
    .dash-table-head { display: none; }
    .dash-table-row { grid-template-columns: 1fr 1fr; gap: 6px 12px; }
  }
  @media (max-width: 560px) {
    .dash-header-right .mt5-pill { display: none; }
    .sync-grid { grid-template-columns: 1fr; }
    .sync-graph { width: 140px; }
    .mt5-left { flex-direction: column; align-items: flex-start; }
  }
`
