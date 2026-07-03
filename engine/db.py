"""MySQL access for the engine (same database as the Next.js app)."""
import mysql.connector
from mysql.connector import pooling
import config

_pool = pooling.MySQLConnectionPool(
    pool_name="fxmirror_engine",
    pool_size=5,
    host=config.MYSQL_HOST,
    port=config.MYSQL_PORT,
    user=config.MYSQL_USER,
    password=config.MYSQL_PASSWORD,
    database=config.MYSQL_DATABASE,
    autocommit=True,
)


def _conn():
    return _pool.get_connection()


def fetch_all(sql: str, params: tuple = ()):
    conn = _conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        return cur.fetchall()
    finally:
        conn.close()


def fetch_one(sql: str, params: tuple = ()):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def execute(sql: str, params: tuple = ()):
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur.rowcount
    finally:
        conn.close()


# ---- Domain helpers ----

def get_connectable_accounts():
    """All MT5 accounts that should be synced (pending = verify, connected = keep live).

    Joins the user so the engine can enforce the trial rule (trial users may only
    run a DEMO account). `trial_active` is 1 while the free trial is still valid.
    """
    return fetch_all(
        """SELECT a.user_id, a.login, a.server, a.password_enc, a.is_demo,
                  a.status, a.copy_enabled,
                  (u.trial_ends_at IS NOT NULL AND u.trial_ends_at > UTC_TIMESTAMP()) AS trial_active
             FROM mt5_accounts a
             JOIN users u ON u.id = a.user_id
            WHERE a.status IN ('pending', 'connected')"""
    )


def mark_account_connected(user_id: str, info: dict):
    is_demo = 1 if info.get("account_type") == "Demo" else 0
    execute(
        """UPDATE mt5_accounts
              SET status='connected', status_message=NULL,
                  broker=%s, account_type=%s, is_demo=%s, leverage=%s, currency=%s,
                  balance=%s, equity=%s, free_margin=%s, daily_profit=%s,
                  last_sync_at=UTC_TIMESTAMP()
            WHERE user_id=%s""",
        (
            info.get("broker"), info.get("account_type"), is_demo, info.get("leverage"),
            info.get("currency"), info.get("balance"), info.get("equity"),
            info.get("free_margin"), info.get("daily_profit"), user_id,
        ),
    )


def mark_account_error(user_id: str, message: str):
    execute(
        "UPDATE mt5_accounts SET status='error', status_message=%s WHERE user_id=%s",
        (message[:255], user_id),
    )


def get_open_copied_trades(user_id: str):
    return fetch_all(
        "SELECT * FROM copied_trades WHERE user_id=%s AND status='open'",
        (user_id,),
    )


def record_open_trade(user_id, master_ticket, slave_ticket, symbol, side, volume, open_price):
    execute(
        """INSERT INTO copied_trades
              (user_id, master_ticket, slave_ticket, symbol, side, volume, open_price, status, opened_at)
           VALUES (%s,%s,%s,%s,%s,%s,%s,'open',UTC_TIMESTAMP())
           ON DUPLICATE KEY UPDATE slave_ticket=VALUES(slave_ticket), status='open'""",
        (user_id, master_ticket, slave_ticket, symbol, side, volume, open_price),
    )


def record_failed_trade(user_id, master_ticket, symbol, side, volume):
    execute(
        """INSERT INTO copied_trades
              (user_id, master_ticket, symbol, side, volume, status)
           VALUES (%s,%s,%s,%s,%s,'failed')
           ON DUPLICATE KEY UPDATE status='failed'""",
        (user_id, master_ticket, symbol, side, volume),
    )


def close_copied_trade(user_id, master_ticket, close_price, profit):
    execute(
        """UPDATE copied_trades
              SET status='closed', close_price=%s, profit=%s, closed_at=UTC_TIMESTAMP()
            WHERE user_id=%s AND master_ticket=%s AND status='open'""",
        (close_price, profit, user_id, master_ticket),
    )
