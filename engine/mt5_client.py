"""Thin wrapper around the MetaTrader5 Python library.

IMPORTANT: the MetaTrader5 library controls ONE terminal and is logged into
ONE account at a time. To service many users we log in sequentially with
mt5.login(...) and switch accounts one after another inside each loop tick.
For higher throughput, run several portable MT5 terminals (one engine process
each) and shard the accounts between them.
"""
import MetaTrader5 as mt5
import config


def initialize_terminal() -> bool:
    """Attach to the MT5 terminal.

    IMPORTANT: we do NOT pass login/password/server here. Passing the master
    credentials makes mt5.initialize() try to (re)launch and switch the terminal,
    which fails with (-10005, 'IPC timeout') when a terminal is already open on a
    different account. Instead we just attach to the running/target terminal, and
    the master + user logins are performed later with mt5.login() in the loop.
    """
    timeout = config.MT5_TIMEOUT
    path = config.MT5_TERMINAL_PATH
    portable = config.MT5_PORTABLE

    # Two strategies, no credentials: never pass login/password/server to
    # initialize() — doing so forces MT5 to SWITCH accounts, which disables
    # Algorithmic Trading and causes IPC timeouts.
    # Strategy 1: explicit path to terminal64.exe (preferred when MT5_TERMINAL_PATH set).
    # Strategy 2: plain attach — lets the library find the running terminal on its own.
    strategies = []
    if path:
        strategies.append(("path", lambda: mt5.initialize(path, timeout=timeout, portable=portable)))
    strategies.append(("attach", lambda: mt5.initialize(timeout=timeout, portable=portable)))

    last_err = None
    for name, run in strategies:
        try:
            ok = run()
        except Exception as exc:  # noqa: BLE001
            ok = False
            last_err = ("exception", str(exc))
            print(f"[MT5] initialize strategy '{name}' raised:", exc)
            continue
        if ok:
            term = mt5.terminal_info()
            if term is not None:
                print(f"[MT5] attached via '{name}': {term.name} (build {term.build}), "
                      f"connected={term.connected}, trade_allowed={term.trade_allowed}")
            return True
        last_err = mt5.last_error()
        print(f"[MT5] initialize strategy '{name}' failed:", last_err)
        mt5.shutdown()

    print("[MT5] All initialize strategies failed. Last error:", last_err)
    code = last_err[0] if last_err else None
    if code == -10005:
        print("[MT5] Error -10005 = IPC timeout. The Python package could not open the")
        print("      shared-memory channel to the terminal. Most common fixes:")
        print("      1) UPDATE the MetaTrader5 Python package to match the terminal build:")
        print("         C:\\Python314\\python.exe -m pip install --upgrade MetaTrader5")
        print("      2) MT5 and Python must run in the SAME Windows session (both in RDP,")
        print("         not one in RDP and one via SSH/service session 0).")
        print("      3) Run both MT5 and PowerShell at the SAME privilege level")
        print("         (both as Administrator, or both as normal user).")
        print("      4) Make sure 'Allow Algorithmic Trading' is enabled in MT5:")
        print("         Tools > Options > Expert Advisors.")
        try:
            print(f"      [diag] MetaTrader5 package version: {mt5.__version__}")
        except Exception:  # noqa: BLE001
            pass
    elif code == -6:
        print("[MT5] Error -6 = Authorization failed.")
        print("      * Same privilege level required for MT5 and Python.")
        print("      * Enable 'Allow Algorithmic Trading' in MT5 Options.")
    else:
        print("[MT5] Checklist: 1) MT5 is open and logged in, 2) MT5_TERMINAL_PATH points")
        print("      to the running terminal64.exe, 3) Algorithmic Trading enabled.")
    return False


def login(account_login: int, password: str, server: str) -> bool:
    """Switch the terminal to a specific account."""
    ok = mt5.login(account_login, password=password, server=server)
    if not ok:
        print(f"[MT5] login failed for {account_login}@{server}:", mt5.last_error())
    return ok


def account_snapshot() -> dict | None:
    info = mt5.account_info()
    if info is None:
        return None
    return {
        "broker": info.company,
        "account_type": "Demo" if info.trade_mode == 0 else "Real",
        "leverage": info.leverage,
        "currency": info.currency,
        "balance": round(info.balance, 2),
        "equity": round(info.equity, 2),
        "free_margin": round(info.margin_free, 2),
        "daily_profit": round(info.profit, 2),
    }


def get_open_positions() -> list:
    positions = mt5.positions_get()
    if positions is None:
        return []
    return list(positions)


def _filling_mode(symbol: str):
    info = mt5.symbol_info(symbol)
    if info is None:
        return mt5.ORDER_FILLING_IOC
    # Prefer the symbol's allowed filling type.
    if info.filling_mode & 1:
        return mt5.ORDER_FILLING_FOK
    if info.filling_mode & 2:
        return mt5.ORDER_FILLING_IOC
    return mt5.ORDER_FILLING_RETURN


def ensure_symbol(symbol: str) -> bool:
    info = mt5.symbol_info(symbol)
    if info is None:
        return False
    if not info.visible:
        return mt5.symbol_select(symbol, True)
    return True


def open_market_order(symbol: str, side: str, volume: float):
    """side: 'BUY' or 'SELL'. Returns the mt5 order result (or None)."""
    if not ensure_symbol(symbol):
        print(f"[MT5] symbol not available: {symbol}")
        return None
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        return None
    is_buy = side == "BUY"
    price = tick.ask if is_buy else tick.bid
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(volume),
        "type": mt5.ORDER_TYPE_BUY if is_buy else mt5.ORDER_TYPE_SELL,
        "price": price,
        "deviation": config.DEVIATION,
        "magic": config.MAGIC,
        "comment": "FXMIRROR copy",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(symbol),
    }
    return mt5.order_send(request)


def close_position(position) -> bool:
    """Close an open position by sending the opposite market order."""
    symbol = position.symbol
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        return False
    is_long = position.type == mt5.POSITION_TYPE_BUY
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": position.volume,
        "type": mt5.ORDER_TYPE_SELL if is_long else mt5.ORDER_TYPE_BUY,
        "position": position.ticket,
        "price": tick.bid if is_long else tick.ask,
        "deviation": config.DEVIATION,
        "magic": config.MAGIC,
        "comment": "FXMIRROR close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(symbol),
    }
    result = mt5.order_send(request)
    return result is not None and result.retcode == mt5.TRADE_RETCODE_DONE


def shutdown():
    mt5.shutdown()
