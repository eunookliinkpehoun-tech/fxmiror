"""Master -> slave trade replication logic."""
import MetaTrader5 as mt5
import config
import db
import mt5_client as client


def compute_volume(master_volume: float, master_balance: float, slave_balance: float) -> float:
    if config.COPY_MODE == "fixed":
        vol = config.COPY_FIXED_LOT
    elif config.COPY_MODE == "multiplier":
        vol = master_volume * config.COPY_MULTIPLIER
    else:  # "balance" proportional scaling
        ratio = (slave_balance / master_balance) if master_balance > 0 else 1.0
        vol = master_volume * ratio
    vol = max(config.MIN_LOT, min(config.MAX_LOT, vol))
    # Round to 2 decimals (most brokers use 0.01 lot steps).
    return round(vol, 2)


def side_of(position) -> str:
    return "BUY" if position.type == mt5.POSITION_TYPE_BUY else "SELL"


def sync_slave(account: dict, master_positions: list, master_balance: float) -> None:
    """Replicate the current master positions onto one slave account.

    `account` is a row from mt5_accounts. The terminal must already be logged
    into this slave account before calling.
    """
    user_id = account["user_id"]

    snap = client.account_snapshot()
    if snap is None:
        db.mark_account_error(user_id, "Impossible de lire les informations du compte après connexion.")
        return

    # Enforce the trial rule using the REAL account type reported by MT5
    # (account_info().trade_mode), not a guess from the server name.
    is_real = snap.get("account_type") != "Demo"
    if account.get("trial_active") and is_real:
        db.mark_account_error(
            user_id,
            "Periode d'essai: vous ne pouvez connecter qu'un compte DEMO. Ce compte est REEL.",
        )
        return

    db.mark_account_connected(user_id, snap)

    if not account.get("copy_enabled"):
        return

    slave_balance = snap["balance"]

    # Index master positions by ticket.
    master_by_ticket = {p.ticket: p for p in master_positions}

    # Already-copied open trades for this user.
    open_copies = db.get_open_copied_trades(user_id)
    copied_master_tickets = {c["master_ticket"] for c in open_copies}

    # 1) OPEN new master positions that are not yet copied.
    for ticket, pos in master_by_ticket.items():
        if ticket in copied_master_tickets:
            continue
        side = side_of(pos)
        volume = compute_volume(pos.volume, master_balance, slave_balance)
        result = client.open_market_order(pos.symbol, side, volume)
        if result is not None and result.retcode == mt5.TRADE_RETCODE_DONE:
            slave_ticket = getattr(result, "order", None) or getattr(result, "deal", None)
            db.record_open_trade(user_id, ticket, slave_ticket, pos.symbol, side, volume, pos.price_open)
            print(f"[COPY] {user_id} opened {side} {volume} {pos.symbol} (master #{ticket})")
        else:
            code = result.retcode if result is not None else "no-result"
            db.record_failed_trade(user_id, ticket, pos.symbol, side, volume)
            print(f"[COPY] {user_id} FAILED {side} {volume} {pos.symbol}: {code}")

    # 2) CLOSE copies whose master position has disappeared (master closed it).
    for copy in open_copies:
        if copy["master_ticket"] in master_by_ticket:
            continue
        slave_ticket = copy.get("slave_ticket")
        closed = False
        profit = 0.0
        close_price = None
        if slave_ticket:
            positions = mt5.positions_get(ticket=int(slave_ticket))
            if positions:
                p = positions[0]
                profit = p.profit
                tick = mt5.symbol_info_tick(p.symbol)
                close_price = (tick.bid if p.type == mt5.POSITION_TYPE_BUY else tick.ask) if tick else None
                closed = client.close_position(p)
            else:
                # Already gone on the slave side -> treat as closed.
                closed = True
        if closed:
            db.close_copied_trade(user_id, copy["master_ticket"], close_price, profit)
            print(f"[COPY] {user_id} closed copy of master #{copy['master_ticket']}")
