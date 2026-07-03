"""Thin wrapper around the MetaTrader5 Python library.

IMPORTANT: the MetaTrader5 library controls ONE terminal and is logged into
ONE account at a time. To service many users we log in sequentially with
mt5.login(...) and switch accounts one after another inside each loop tick.
For higher throughput, run several portable MT5 terminals (one engine process
each) and shard the accounts between them.
"""
import os
import glob as _glob
import MetaTrader5 as mt5
import config


def _find_terminal_exe_from_data_folder() -> str | None:
    """
    MT5 stores a symlink/shortcut back to terminal64.exe inside the data folder.
    The data folder path is shown in the MT5 Journal at startup, e.g.:
      C:\\Users\\Administrator\\AppData\\Roaming\\MetaQuotes\\Terminal\\D0E8209F77...
    We scan every known data-folder location and return the first terminal64.exe
    we find, giving us the exact path the library needs.
    """
    roaming = os.environ.get("APPDATA", "")
    patterns = [
        os.path.join(roaming, "MetaQuotes", "Terminal", "*", "terminal64.exe"),
        r"C:\Users\*\AppData\Roaming\MetaQuotes\Terminal\*\terminal64.exe",
        r"C:\Program Files\MetaTrader 5\terminal64.exe",
        r"C:\Program Files (x86)\MetaTrader 5\terminal64.exe",
    ]
    for pattern in patterns:
        found = _glob.glob(pattern)
        if found:
            # Prefer the data-folder copy (inside AppData) as it maps directly
            # to the running terminal's IPC slot.
            return found[0]
    return None


def initialize_terminal() -> bool:
    """Attach to the running MT5 terminal without switching accounts.

    Build >=5836 changed the IPC handshake. The library must be pointed at the
    exact data-folder path (AppData/Roaming/MetaQuotes/Terminal/<hash>/terminal64.exe)
    of the running terminal, not just the install-dir exe. We auto-discover that
    path and try it first before falling back to the plain install-dir path.
    """
    timeout = config.MT5_TIMEOUT
    path = config.MT5_TERMINAL_PATH
    portable = config.MT5_PORTABLE

    # Auto-discover the data-folder terminal64.exe (most reliable on build 5836).
    data_folder_path = _find_terminal_exe_from_data_folder()

    # Build strategy list. Never pass login/password — that switches accounts
    # and triggers "automated trading is disabled".
    strategies: list[tuple[str, str | None]] = []
    if data_folder_path and data_folder_path != path:
        strategies.append(("data-folder", data_folder_path))
    if path:
        strategies.append(("config-path", path))
    strategies.append(("attach", None))  # plain attach, no path

    last_err = None
    for name, exe_path in strategies:
        print(f"[MT5] trying strategy '{name}' path={exe_path!r}")
        try:
            if exe_path:
                ok = mt5.initialize(exe_path, timeout=timeout, portable=portable)
            else:
                ok = mt5.initialize(timeout=timeout, portable=portable)
        except Exception as exc:  # noqa: BLE001
            ok = False
            last_err = ("exception", str(exc))
            print(f"[MT5] initialize strategy '{name}' raised:", exc)
            mt5.shutdown()
            continue
        if ok:
            term = mt5.terminal_info()
            if term is not None:
                print(f"[MT5] attached via '{name}': {term.name} (build {term.build}), "
                      f"connected={term.connected}, trade_allowed={term.trade_allowed}")
                if not term.trade_allowed:
                    print("[MT5] WARNING: trade_allowed=False. In MT5: Tools > Options > "
                          "Expert Advisors > tick 'Allow Algorithmic Trading'.")
            return True
        last_err = mt5.last_error()
        print(f"[MT5] strategy '{name}' failed: {last_err}")
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
