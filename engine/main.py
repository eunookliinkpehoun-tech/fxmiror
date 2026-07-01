"""
FXMIRROR engine entry point.

Loop (every SYNC_INTERVAL seconds):
  1. Log into the MASTER account, read its open positions + balance.
  2. For each connected/pending user account:
       - log into it
       - update its live balance/equity/status in MySQL
       - replicate the master's open positions (and close ones the master closed)
  3. Advance any 24h bot cycles whose window has ended (-> payment_due).

Run on the Windows server where MetaTrader 5 is installed:
    python main.py
"""
import time
import traceback
from datetime import datetime, timezone

import config
import db
import mt5_client as client
from copier import sync_slave
from crypto_util import decrypt_secret


def advance_bot_cycles():
    """Close 24h cycles that have ended and compute the 50/50 fee due."""
    ended = db.fetch_all(
        """SELECT bs.id, bs.user_id, bs.start_balance, a.balance AS current_balance
             FROM bot_sessions bs
             JOIN mt5_accounts a ON a.user_id = bs.user_id
            WHERE bs.state='running' AND bs.cycle_ends_at IS NOT NULL
              AND bs.cycle_ends_at <= UTC_TIMESTAMP()"""
    )
    for row in ended:
        profit = float(row["current_balance"]) - float(row["start_balance"])
        if profit > 0:
            fee = round(profit * 0.5, 2)
            db.execute(
                """UPDATE bot_sessions
                      SET state='payment_due', end_balance=%s, profit=%s, amount_due=%s
                    WHERE id=%s""",
                (row["current_balance"], round(profit, 2), fee, row["id"]),
            )
            print(f"[CYCLE] user {row['user_id']} profit {profit:.2f} -> fee {fee:.2f}")
        else:
            # No profit: close the cycle for free.
            db.execute(
                "UPDATE bot_sessions SET state='closed', end_balance=%s, profit=%s, amount_due=0 WHERE id=%s",
                (row["current_balance"], round(profit, 2), row["id"]),
            )
            print(f"[CYCLE] user {row['user_id']} no profit -> closed")


def update_bot_profit():
    """Keep the provisional profit fresh for running cycles."""
    db.execute(
        """UPDATE bot_sessions bs
             JOIN mt5_accounts a ON a.user_id = bs.user_id
              SET bs.profit = a.balance - bs.start_balance
            WHERE bs.state='running'"""
    )


def tick():
    # 1) Master
    if not client.login(config.MASTER_LOGIN, config.MASTER_PASSWORD, config.MASTER_SERVER):
        print("[MASTER] login failed, skipping tick")
        return
    master_snap = client.account_snapshot()
    master_positions = client.get_open_positions()
    master_balance = master_snap["balance"] if master_snap else 0.0
    print(f"[{datetime.now(timezone.utc):%H:%M:%S}] master positions: {len(master_positions)}")

    # 2) Slaves
    accounts = db.get_connectable_accounts()
    for acc in accounts:
        try:
            password = decrypt_secret(acc["password_enc"])
        except Exception as exc:  # noqa: BLE001
            db.mark_account_error(acc["user_id"], f"Decrypt error: {exc}")
            continue

        if not client.login(int(acc["login"]), password, acc["server"]):
            db.mark_account_error(acc["user_id"], "MT5 login refused. Check credentials/server.")
            continue

        try:
            sync_slave(acc, master_positions, master_balance)
        except Exception:  # noqa: BLE001
            print("[SLAVE] error:", traceback.format_exc())

    # 3) Cycles
    update_bot_profit()
    advance_bot_cycles()


def main():
    print("FXMIRROR engine starting...")
    if not client.initialize_terminal():
        raise SystemExit("Could not initialize MT5 terminal. Is MT5 installed and the path correct?")
    print("MT5 terminal initialized. Entering sync loop.")
    try:
        while True:
            try:
                tick()
            except Exception:  # noqa: BLE001
                print("[TICK] error:", traceback.format_exc())
            time.sleep(config.SYNC_INTERVAL)
    finally:
        client.shutdown()


if __name__ == "__main__":
    main()
